import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { MQL5_SYSTEM_PROMPT } from '@/lib/mql5-prompt';
import { validateMQL5Code, extractIndicatorName } from '@/lib/validator';

const DAILY_LIMIT = 5;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function checkRateLimit(userId: string): Promise<{ allowed: boolean; used: number }> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc('get_daily_usage', { p_user_id: userId });
    if (error) return { allowed: true, used: 0 };
    const used = typeof data === 'number' ? data : 0;
    return { allowed: used < DAILY_LIMIT, used };
  } catch {
    return { allowed: true, used: 0 };
  }
}

async function saveIndicator(params: {
  userId: string;
  name: string;
  description: string;
  indicatorType: string;
  timeframe: string;
  code: string;
  isValid: boolean;
}) {
  try {
    const supabase = getSupabaseAdmin();
    // Log usage
    await supabase.from('usage_logs').insert({ user_id: params.userId });
    // Save indicator
    const { error } = await supabase.from('indicators').insert({
      user_id: params.userId,
      name: params.name,
      description: params.description,
      indicator_type: params.indicatorType,
      timeframe: params.timeframe,
      code: params.code,
      is_valid: params.isValid,
    });
    if (error) console.error('Failed to save indicator:', error.message);
  } catch (err) {
    console.error('saveIndicator error:', err);
  }
}

function buildUserPrompt(prompt: string, indicatorType: string, timeframe: string): string {
  const parts: string[] = [];

  if (indicatorType && indicatorType !== 'custom') {
    const typeHint: Record<string, string> = {
      trend: 'This is a TREND indicator that should appear in the CHART WINDOW (indicator_chart_window).',
      oscillator: 'This is an OSCILLATOR that should appear in a SEPARATE WINDOW (indicator_separate_window) with values between 0–100 or -100 to 100.',
      volume: 'This is a VOLUME indicator. It should appear in a separate window and use the tick_volume or volume array.',
      volatility: 'This is a VOLATILITY indicator. Use ATR, Bollinger Bands width, or similar as its base.',
    };
    if (typeHint[indicatorType]) parts.push(typeHint[indicatorType]);
  }

  if (timeframe && timeframe !== 'any') {
    parts.push(`The user mentioned they primarily use this on the ${timeframe} timeframe, but generate it to work on any timeframe (_Period).`);
  }

  parts.push(`User request: ${prompt}`);
  parts.push('Generate the complete MQL5 indicator file now. Return ONLY the raw code.');

  return parts.join('\n\n');
}

async function callClaude(userPrompt: string, fixPrompt?: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const messages: Anthropic.MessageParam[] = fixPrompt
    ? [
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: fixPrompt.split('--- ORIGINAL CODE ---\n')[1]?.split('\n--- ERRORS ---')[0] ?? ''  },
        { role: 'user', content: fixPrompt },
      ]
    : [{ role: 'user', content: userPrompt }];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3500,
    system: MQL5_SYSTEM_PROMPT,
    messages,
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

  // Strip any accidental markdown fences
  return content.text
    .replace(/^```[\w]*\n?/m, '')
    .replace(/\n?```$/m, '')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, indicatorType = 'custom', timeframe = 'any', userId } = body as {
      prompt: string;
      indicatorType?: string;
      timeframe?: string;
      userId?: string;
    };

    // --- Input validation ---
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      return NextResponse.json({ error: 'Prompt must be at least 10 characters.' }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API not configured. Contact support.' }, { status: 500 });
    }

    // --- Rate limiting ---
    if (userId) {
      const { allowed, used } = await checkRateLimit(userId);
      if (!allowed) {
        return NextResponse.json(
          { error: `Daily limit of ${DAILY_LIMIT} reached. Resets at midnight UTC.`, used },
          { status: 429 }
        );
      }
    }

    // --- Build prompt & call Claude ---
    const userPrompt = buildUserPrompt(prompt.trim(), indicatorType, timeframe);
    let code = await callClaude(userPrompt);

    // --- Validate ---
    let validation = validateMQL5Code(code);

    // --- Extract name ---
    const indicatorName = extractIndicatorName(code);

    // --- Persist ---
    if (userId) {
      await saveIndicator({
        userId,
        name: indicatorName,
        description: prompt.trim(),
        indicatorType,
        timeframe,
        code,
        isValid: validation.valid,
      });
    }

    return NextResponse.json(
      { code, indicatorName, valid: validation.valid, warnings: [...validation.errors, ...validation.warnings] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('/api/generate error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Generation failed: ${message}` }, { status: 500 });
  }
}
