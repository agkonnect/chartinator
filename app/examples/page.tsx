import Link from 'next/link';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indicator Examples — Chartinator',
  description: 'Browse 15 ready-to-use MQL5 indicator prompts. One click to generate.',
};

const EXAMPLES = [
  {
    category: 'Trend',
    emoji: '📈',
    name: 'Dual EMA Crossover Fill',
    desc: 'Fast and slow EMA with colored fill between them. Green above, red below.',
    prompt: 'Two exponential moving averages — a fast 9 EMA and a slow 21 EMA on the price chart. Fill the area between them green when fast is above slow, red when below. Add buy/sell arrows on crossover.',
  },
  {
    category: 'Trend',
    emoji: '🎀',
    name: 'MA Ribbon',
    desc: '5 EMAs from fast to slow forming a rainbow ribbon on the chart.',
    prompt: 'Moving average ribbon with 5 EMAs at periods 8, 13, 21, 34, 55 plotted on the price chart. Use gradient colors from cyan (fastest) to dark blue (slowest). When all MAs are aligned upward color them all green, downward all red.',
  },
  {
    category: 'Trend',
    emoji: '🐊',
    name: 'Alligator Indicator',
    desc: "Bill Williams' Alligator with jaw, teeth, and lips smoothed moving averages.",
    prompt: "Bill Williams Alligator indicator. Three smoothed moving averages: Jaw (blue, 13 period, shift 8), Teeth (red, 8 period, shift 5), Lips (green, 5 period, shift 3). Display in chart window.",
  },
  {
    category: 'Oscillator',
    emoji: '〰️',
    name: 'RSI Color Zones',
    desc: 'RSI with overbought/oversold zones color-coded for instant reading.',
    prompt: 'RSI indicator period 14 in separate window. Paint the line green when below 30 (oversold), red when above 70 (overbought), and gray in between. Add horizontal dotted lines at 30, 50, and 70. Fill background lightly.',
  },
  {
    category: 'Oscillator',
    emoji: '🏔️',
    name: 'MACD Color Histogram',
    desc: 'MACD with 4-color histogram showing momentum direction and strength.',
    prompt: 'MACD oscillator fast 12, slow 26, signal 9. Histogram bars: dark green rising above zero, light green falling above zero, dark red falling below zero, light red rising below zero. Signal line in orange, MACD line in white.',
  },
  {
    category: 'Oscillator',
    emoji: '🎯',
    name: 'Stochastic Arrows',
    desc: 'Stochastic with buy/sell arrows on the price chart at crossover signals.',
    prompt: 'Stochastic oscillator K 14, D 3, slowing 3. When K crosses above D below 20 draw a green up arrow on the price chart. When K crosses below D above 80 draw a red down arrow. Also show the oscillator in a sub-window.',
  },
  {
    category: 'Oscillator',
    emoji: '⚡',
    name: 'RSI Divergence Scanner',
    desc: 'RSI with visual divergence markers when price and RSI disagree.',
    prompt: 'RSI period 14 with divergence detection. When price makes a higher high but RSI makes a lower high (bearish divergence) draw a red dot on the RSI. When price makes a lower low but RSI makes a higher low (bullish divergence) draw a green dot. Show in sub-window.',
  },
  {
    category: 'Volume',
    emoji: '📊',
    name: 'Volume Spike Detector',
    desc: 'Volume bars color-coded by size relative to recent average.',
    prompt: 'Volume indicator in sub-window. Color bars bright orange when volume exceeds 2x the 20-period average (spike), blue when above average, gray when below average. Add a thin line showing the 20-period volume average.',
  },
  {
    category: 'Volume',
    emoji: '💧',
    name: 'OBV Trend Meter',
    desc: 'On-Balance Volume with trend coloring and signal line.',
    prompt: 'On-Balance Volume (OBV) indicator in a sub-window. Add a 20-period EMA of OBV as a signal line. Color the OBV line green when it is above the signal line, red when below. Fill area between OBV and signal line with transparent color.',
  },
  {
    category: 'Volatility',
    emoji: '🎸',
    name: 'Bollinger Bands Squeeze',
    desc: 'Bollinger Bands with squeeze detection and background coloring.',
    prompt: 'Bollinger Bands period 20, 2 standard deviations. Color background light green when bands are expanding, light red when squeezing (narrowing for 3+ bars). Add a dot below the chart when a squeeze releases (bands expand after 5+ bars of squeezing).',
  },
  {
    category: 'Volatility',
    emoji: '🌊',
    name: 'ATR Volatility Meter',
    desc: 'ATR-based meter showing current volatility regime as low/medium/high.',
    prompt: 'ATR volatility meter in sub-window using 14-period ATR. Normalize to percentage of price. Color zone: below 0.5% is low volatility (blue), 0.5-1.5% is medium (yellow), above 1.5% is high volatility (red). Show as colored histogram bars.',
  },
  {
    category: 'Multi-Signal',
    emoji: '🚦',
    name: 'Triple Signal Dashboard',
    desc: 'Combined RSI + MACD + Stochastic signal dashboard in one sub-window.',
    prompt: 'Create a signal dashboard indicator in a sub-window. Show three colored squares side by side: one for RSI (green if <40, red if >60, gray otherwise), one for MACD (green if histogram positive and rising, red if negative and falling), one for Stochastic (green if K>D and <80, red if K<D and >20). Label each square.',
  },
  {
    category: 'Multi-Signal',
    emoji: '🎪',
    name: 'Market Structure Levels',
    desc: 'Auto-draws support and resistance lines based on recent swing highs and lows.',
    prompt: 'Support and resistance indicator that automatically draws horizontal lines at the last 3 swing highs (red dashed lines) and last 3 swing lows (green dashed lines) on the price chart. A swing high is a bar where the high is higher than the 3 bars on each side. Use iHigh and iLow for calculations.',
  },
  {
    category: 'Price Action',
    emoji: '🕯️',
    name: 'Candle Pattern Markers',
    desc: 'Marks Doji, Hammer, and Engulfing candle patterns directly on the chart.',
    prompt: 'Candle pattern marker indicator. Detect and mark three patterns on the chart: 1) Doji (open nearly equals close, within 10% of range) — mark with a yellow dot above the bar. 2) Hammer (lower shadow 2x body, small upper shadow) — mark with green triangle below. 3) Bearish engulfing — mark with red triangle above.',
  },
  {
    category: 'Price Action',
    emoji: '📐',
    name: 'Pivot Points',
    desc: 'Classic daily pivot points with support and resistance levels.',
    prompt: 'Daily pivot point indicator showing classic pivot, S1, S2, R1, R2 levels as horizontal lines on the chart. Calculate from previous day OHLC. Pivot line in white, support lines in green (S1 solid, S2 dashed), resistance lines in red (R1 solid, R2 dashed). Show price labels on the right.',
  },
];

const CATEGORIES = ['All', 'Trend', 'Oscillator', 'Volume', 'Volatility', 'Multi-Signal', 'Price Action'];

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-full px-4 py-1.5 mb-4">
            ⚡ 15 Ready-to-Use Prompts
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            What Can You Build?
          </h1>
          <p className="text-[#94a3b8] text-base max-w-xl mx-auto">
            Browse real indicator examples. Click any card to generate it instantly — or use it as a starting point for your own idea.
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <span key={cat} className="px-3 py-1 text-xs rounded-full border border-[#1e3a5f] text-[#94a3b8]">
              {cat}
            </span>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXAMPLES.map((ex) => (
            <div
              key={ex.name}
              className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-5 flex flex-col gap-3 hover:border-[#00D4FF]/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{ex.emoji}</span>
                  <div>
                    <h3 className="font-bold text-white text-sm">{ex.name}</h3>
                    <span className="text-xs text-[#475569]">{ex.category}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#64748b] leading-relaxed flex-1">{ex.desc}</p>
              <Link
                href={`/generate?prompt=${encodeURIComponent(ex.prompt)}`}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF] hover:text-[#0a0e1a] transition-all"
              >
                ⚡ Use this prompt
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-[#475569] text-sm mb-4">Have your own idea? Describe it in plain English.</p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 bg-[#00D4FF] text-[#0a0e1a] font-bold px-6 py-3 rounded-xl hover:bg-[#00b8d9] transition-colors shadow-[0_0_20px_rgba(0,212,255,0.3)]"
          >
            ⚡ Start from scratch
          </Link>
        </div>
      </div>
    </div>
  );
}
