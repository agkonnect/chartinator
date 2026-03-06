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
}

export default function GeneratorForm({
  onResult, onLoading, onLimitReached, usageCount, dailyLimit = 5, userId,
}: Props) {
  const [prompt, setPrompt] = useState('');
  const [indicatorType, setIndicatorType] = useState('custom');
  const [timeframe, setTimeframe] = useState('any');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phIdx, setPhIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rotate placeholder text
  useEffect(() => {
    const t = setInterval(() => setPhIdx((i) => (i + 1) % PLACEHOLDERS.length), 3500);
    return () => clearInterval(t);
  }, []);

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
        headers: { 'Content-Type': 'application/json' },
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
            Generating your indicator...
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
