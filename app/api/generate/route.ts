import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { MQL5_SYSTEM_PROMPT } from '@/lib/mql5-prompt';
import { validateMQL5Code, extractIndicatorName } from '@/lib/validator';

function buildUserPrompt(prompt: string, indicatorType: string, timeframe: string): string {
  const parts: string[] = [];

  if (indicatorType && indicatorType !== 'custom') {
    const typeHint: Record<string, string> = {
      trend: 'This is a TREND indicator that should appear in the CHART WINDOW (indicator_chart_window).',
      oscillator: 'This is an OSCILLATOR that should appear in a SEPARATE WINDOW (indicator_separate_window) with values between 0-100 or -100 to 100.',
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

async function callClaude(userPrompt: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3500,
    system: MQL5_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

  return content.text
    .replace(/^```[\w]*\n?/m, '')
    .replace(/\n?```$/m, '')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, indicatorType = 'custom', timeframe = 'any' } = body as {
      prompt: string;
      indicatorType?: string;
      timeframe?: string;
    };

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      return NextResponse.json({ error: 'Prompt must be at least 10 characters.' }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API not configured. Contact support.' }, { status: 500 });
    }

    const userPrompt = buildUserPrompt(prompt.trim(), indicatorType, timeframe);
    const code = await callClaude(userPrompt);
    const validation = validateMQL5Code(code);
    const indicatorName = extractIndicatorName(code);

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
