'use client';
import { useState, useEffect, useRef } from 'react';
import { Zap, ChevronDown } from 'lucide-react';

const PLACEHOLDERS = [
  'Moving average that turns blue on uptrend, red on downtrend...',
  'RSI with colored overbought/oversold zones and dotted level lines...',
  'Bollinger Bands with colored background fill between the bands...',
  'MACD histogram that changes color on zero-line crossover...',
  'ATR-based volatility meter showing high/low volatility zones...',
  'Stochastic oscillator with signal line crossover arrows...',
  'Volume bars colored green/red based on price direction...',
  'Moving average ribbon of 5 EMAs from 8 to 200 periods...',
];

const LOADING_MESSAGES = [
  'Parsing your strategy...',
  'Writing OnInit()...',
  'Declaring indicator buffers...',
  'Crafting OnCalculate() logic...',
  'Calibrating plot properties...',
  'Checking for INVALID_HANDLE...',
  'Optimizing for MetaTrader 5...',
  'Setting index buffers...',
  'Running validation pass...',
  'Almost ready...',
];

const QUICK_PROMPTS = [
  {
    label: 'RSI Color Zones',
    prompt: 'RSI indicator with period 14. Paint the line green when below 30, red when above 70, and gray in between. Add horizontal dotted lines at 30 and 70.',
  },
  {
    label: 'EMA Crossover Fill',
    prompt: 'Two exponential moving averages — a fast 9 EMA and a slow 21 EMA plotted on the price chart. When the fast crosses above the slow, fill the gap between them blue. When the fast crosses below, fill red.',
  },
  {
    label: 'MACD Color Histogram',
    prompt: 'Classic MACD oscillator with fast 12, slow 26, signal 9. Histogram bars should be dark green when rising above zero, light green when falling above zero, dark red when falling below zero, light red when rising below zero.',
  },
  {
    label: 'Volume Spike Detector',
    prompt: 'Volume indicator in a sub-window. Color bars bright orange when volume is more than 2x the 20-period average, blue when above average, and gray when below average.',
  },
  {
    label: 'Bollinger Bands Squeeze',
    prompt: 'Bollinger Bands with period 20 and 2 standard deviations. Add a colored background: light green when the bands are expanding, light red when squeezing (bands narrowing for 3 or more bars).',
  },
  {
    label: 'Stochastic Arrows',
    prompt: 'Stochastic oscillator K 14, D 3, slowing 3. When K crosses above D below 20, draw a green up arrow on the price chart. When K crosses below D above 80, draw a red down arrow.',
  },
];

const INDICATOR_TYPES = [
  { value: 'custom',     label: 'Auto-detect' },
  { value: 'trend',      label: 'Trend (chart window)' },
  { value: 'oscillator', label: 'Oscillator (separate window)' },
  { value: 'volume',     label: 'Volume' },
  { value: 'volatility', label: 'Volatility' },
];

const TIMEFRAMES = [
  { value: 'any', label: 'Any timeframe' },
  { value: 'M1',  label: 'M1 — 1 Minute' },
  { value: 'M5',  label: 'M5 — 5 Minutes' },
  { value: 'M15', label: 'M15 — 15 Minutes' },
  { value: 'H1',  label: 'H1 — 1 Hour' },
  { value: 'H4',  label: 'H4 — 4 Hours' },
  { value: 'D1',  label: 'D1 — Daily' },
];

export interface GenerateResult {
  code: string;
  indicatorName: string;
  valid: boolean;
  warnings: string[];
}

interface Props {
  onResult: (result: GenerateResult) => void;
  onLoading: (loading: boolean) => void;
  onLimitReached: () => void;
  usageCount: number;
  dailyLimit?: number;
  userId?: string;
  accessToken?: string;
}

export default function GeneratorForm({
  onResult, onLoading, onLimitReached, usageCount, dailyLimit = 5, userId, accessToken,
}: Props) {
  const [prompt, setPrompt] = useState('');
  const [indicatorType, setIndicatorType] = useState('custom');
  const [timeframe, setTimeframe] = useState('any');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phIdx, setPhIdx] = useState(0);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rotate placeholder text
  useEffect(() => {
    const t = setInterval(() => setPhIdx((i) => (i + 1) % PLACEHOLDERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  // Rotate loading messages while generating
  useEffect(() => {
    if (!loading) return;
    setLoadingMsgIdx(0);
    const t = setInterval(() => setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || prompt.trim().length < 10) {
      setError('Please describe your indicator in more detail (at least 10 characters).');
      return;
    }
    if (usageCount >= dailyLimit) {
      onLimitReached();
      return;
    }
    setError(null);
    setLoading(true);
    onLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ prompt: prompt.trim(), indicatorType, timeframe, userId }),
      });

      if (res.status === 429) {
        onLimitReached();
        return;
      }

      // Guard against HTML error pages (e.g. Netlify timeout returns HTML)
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text.slice(0, 200));
        setError('Request timed out or server error — please try again.');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `Server error (${res.status})`);
        return;
      }

      onResult(data as GenerateResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error — please try again.');
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const selClass = `w-full bg-[#0d1117] border border-[#1e3a5f] rounded-xl px-3 py-2.5 text-sm
    text-[#e2e8f0] focus:outline-none focus:border-[#00D4FF] transition-colors
    appearance-none cursor-pointer`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main textarea */}
      <div>
        <label className="block text-xs text-[#94a3b8] font-semibold uppercase tracking-wider mb-2">
          Describe your indicator
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp.label}
              type="button"
              disabled={loading}
              onClick={() => { setPrompt(qp.prompt); setError(null); textareaRef.current?.focus(); }}
              className="px-2.5 py-1 text-xs rounded-lg border border-[#1e3a5f] text-[#64748b]
                hover:border-[#00D4FF] hover:text-[#00D4FF] hover:bg-[#00D4FF]/5
                transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              {qp.label}
            </button>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setError(null); }}
          placeholder={PLACEHOLDERS[phIdx]}
          rows={5}
          disabled={loading}
          className="w-full bg-[#0d1117] border border-[#1e3a5f] rounded-xl px-4 py-3
            text-sm text-[#e2e8f0] placeholder-[#334155] resize-none leading-relaxed
            focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_0_1px_rgba(0,212,255,0.15)]
            transition-all disabled:opacity-50 font-sans"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[#334155]">{prompt.length}/2000</span>
          {prompt.length < 10 && prompt.length > 0 && (
            <span className="text-xs text-[#f59e0b]">Add more detail for better results</span>
          )}
        </div>
      </div>

      {/* Options row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <label className="block text-xs text-[#94a3b8] font-semibold uppercase tracking-wider mb-1.5">
            Type
          </label>
          <div className="relative">
            <select
              value={indicatorType}
              onChange={(e) => setIndicatorType(e.target.value)}
              disabled={loading}
              className={selClass}
            >
              {INDICATOR_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#94a3b8] font-semibold uppercase tracking-wider mb-1.5">
            Timeframe hint
          </label>
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              disabled={loading}
              className={selClass}
            >
              {TIMEFRAMES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl text-sm text-[#ef4444]">
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || prompt.trim().length < 10}
        className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm
          transition-all ${
          loading || prompt.trim().length < 10
            ? 'bg-[#1a2235] text-[#475569] cursor-not-allowed border border-[#1e3a5f]'
            : 'bg-[#00D4FF] text-[#0a0e1a] hover:bg-[#00b8d9] shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_28px_rgba(0,212,255,0.45)]'
        }`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-[#0a0e1a]/30 border-t-[#0a0e1a] rounded-full animate-spin" />
            {LOADING_MESSAGES[loadingMsgIdx]}
          </>
        ) : (
          <>
            <Zap size={16} />
            Generate Indicator ⚡
          </>
        )}
      </button>
    </form>
  );
}
