import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { MQL5_SYSTEM_PROMPT } from '@/lib/mql5-prompt';

export const runtime = 'edge';

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
  parts.push('Generate the complete MQL5 indicator file now. Return ONLY the raw code, no markdown.');

  return parts.join('\n\n');
}

function extractIndicatorName(code: string): string {
  const match = code.match(/#property\s+indicator_label1?\s+"([^"]+)"/) ||
                code.match(/string\s+indicatorName\s*=\s*"([^"]+)"/) ||
                code.match(/string\s+indicator_name\s*=\s*"([^"]+)"/) ||
                code.match(/#property\s+description\s+"([^"]+)"/);  
  if (match) return match[1].replace(/[^a-zA-Z0-9_\s-]/g, '').trim().replace(/\s+/g, '_');
  const funcMatch = code.match(/int\s+OnInit[^{]*{[\s\S]{0,500}?IndicatorSetString[^"]*"([^"]+)"/);
  if (funcMatch) return funcMatch[1].replace(/[^a-zA-Z0-9_\s-]/g, '').trim().replace(/\s+/g, '_');
  return 'MQL5_Indicator';
}

function validateMQL5Code(code: string): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  if (!code.includes('OnCalculate')) warnings.push('Missing OnCalculate() function');
  if (!code.includes('OnInit')) warnings.push('Missing OnInit() function');
  if (!code.includes('#property')) warnings.push('Missing #property declarations');
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) warnings.push(`Brace mismatch: ${openBraces} open vs ${closeBraces} close`);
  return { valid: warnings.length === 0, warnings };
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
      return new Response(
        JSON.stringify({ type: 'error', message: 'Prompt must be at least 10 characters.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ type: 'error', message: 'API not configured.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const userPrompt = buildUserPrompt(prompt.trim(), indicatorType, timeframe);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullCode = '';

        function send(obj: Record<string, unknown>) {
          controller.enqueue(encoder.encode('data: ' + JSON.stringify(obj) + '\n\n'));
        }

        try {
          const claudeStream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 3500,
            system: MQL5_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userPrompt }],
          });

          for await (const chunk of claudeStream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              fullCode += chunk.delta.text;
              send({ type: 'chunk', text: chunk.delta.text });
            }
          }

          // Strip markdown fences if present
          const cleanCode = fullCode
            .replace(/^```[\w]*\n?/m, '')
            .replace(/\n?```$/m, '')
            .trim();

          const validation = validateMQL5Code(cleanCode);
          const indicatorName = extractIndicatorName(cleanCode);

          send({
            type: 'done',
            code: cleanCode,
            indicatorName,
            valid: validation.valid,
            warnings: validation.warnings,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          send({ type: 'error', message: `Generation failed: ${message}` });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ type: 'error', message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
