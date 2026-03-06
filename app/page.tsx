
import Link from 'next/link';
import { Zap, Code2, Download, TrendingUp, Shield, Clock } from 'lucide-react';

const EXAMPLE_CODE = `#property copyright "Chartinator AI"
#property version   "1.00"
#property strict
#property indicator_chart_window
#property indicator_buffers 2
#property indicator_plots   1
#property indicator_type1   DRAW_COLOR_LINE
#property indicator_color1  clrDodgerBlue,clrOrangeRed
#property indicator_width1  2
#property indicator_label1  "TrendMA"

input int InpMAPeriod = 20;
double MABuffer[];
double ColorBuffer[];
int maHandle = INVALID_HANDLE;

int OnInit() {
  SetIndexBuffer(0, MABuffer, INDICATOR_DATA);
  SetIndexBuffer(1, ColorBuffer, INDICATOR_COLOR_INDEX);
  maHandle = iMA(_Symbol,_Period,InpMAPeriod,0,MODE_EMA,PRICE_CLOSE);
  if(maHandle==INVALID_HANDLE) return(INIT_FAILED);
  return(INIT_SUCCEEDED);
}`;

const FEATURES = [
  {
    icon: <Zap size={22} className="text-[#00D4FF]" />,
    title: 'Natural Language Input',
    desc: 'Just describe your indicator in plain English. No MQL5 syntax knowledge required — we handle the code.',
  },
  {
    icon: <Code2 size={22} className="text-[#00D4FF]" />,
    title: 'MT5-Ready Code',
    desc: 'Get clean, compilable MQL5 code with proper buffer declarations, handles, and OnInit/OnCalculate structure.',
  },
  {
    icon: <Download size={22} className="text-[#00D4FF]" />,
    title: 'Instant Download',
    desc: 'Download your .mq5 file and drop it straight into your MetaTrader 5 indicators folder. Done.',
  },
];

const EXAMPLES = [
  'RSI that turns red when above 70, green when below 30',
  'Moving average ribbon — 5 EMAs from 8 to 200 periods',
  'Bollinger Bands with colored fill between the bands',
  'MACD histogram that changes color on zero-line cross',
  'ATR-based volatility meter with high/low zone alerts',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e2e8f0]">
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-[#1e3a5f] bg-[#0a0e1a]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 18L9 12L13 16L21 7" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 7H21V14" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-white">
              Chart<span className="text-[#00D4FF]">inator</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="text-sm text-[#94a3b8] hover:text-white transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/generate"
              className="text-sm font-semibold bg-[#00D4FF] text-[#0a0e1a] px-4 py-2 rounded-lg hover:bg-[#00b8d9] transition-colors"
            >
              Try Free ⚡
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1e3a5f] bg-[#111827] text-xs text-[#94a3b8] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          Powered by Claude 3.5 Sonnet · MT5 indicators only
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
          Turn Plain English into
          <br />
          <span className="gradient-text">MT5 Indicators</span>
        </h1>

        <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto mb-8 leading-relaxed">
          No MQL5 knowledge required. Describe what you want, get production-ready code.
          Download and drop straight into MetaTrader 5.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Link
            href="/generate"
            className="inline-flex items-center justify-center gap-2 bg-[#00D4FF] text-[#0a0e1a] font-bold px-7 py-3.5 rounded-xl hover:bg-[#00b8d9] transition-all shadow-[0_0_20px_rgba(0,212,255,0.35)] text-base"
          >
            <Zap size={18} />
            Generate Free Indicator
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center gap-2 border border-[#1e3a5f] text-[#e2e8f0] font-semibold px-7 py-3.5 rounded-xl hover:border-[#00D4FF]/50 hover:bg-[#111827] transition-all text-base"
          >
            Create Account
          </Link>
        </div>
        <p className="text-xs text-[#475569]">5 free generations per day · No credit card required</p>
      </section>

      {/* Demo section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        <div className="bg-[#111827] border border-[#1e3a5f] rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          {/* Input side */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1e3a5f]">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-[#475569] uppercase tracking-widest font-semibold">Input</span>
              </div>
              <div className="bg-[#0d1117] border border-[#1e3a5f] rounded-xl p-4 font-mono text-sm text-[#94a3b8] leading-relaxed">
                <span className="text-[#00D4FF]">➜</span>{' '}
                <span className="text-[#e2e8f0]">
                  RSI that changes color red when above 70, green when below 30, with dotted level lines
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {EXAMPLES.slice(0, 3).map((ex) => (
                  <div
                    key={ex}
                    className="text-xs text-[#475569] px-3 py-2 rounded-lg bg-[#0d1117] border border-[#1e3a5f]/50"
                  >
                    &ldquo;{ex}&rdquo;
                  </div>
                ))}
              </div>
            </div>

            {/* Code output side */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#475569] uppercase tracking-widest font-semibold">Generated MQL5</span>
                <span className="text-xs text-[#10b981] font-medium">✓ Valid</span>
              </div>
              <div className="bg-[#0d1117] border border-[#1e3a5f] rounded-xl overflow-auto max-h-[260px]">
                <pre className="p-4 text-xs font-mono text-[#c9d1d9] leading-relaxed whitespace-pre">
                  <code>{EXAMPLE_CODE}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center text-white mb-10">
          Everything you need to build MT5 indicators
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-6 card-hover"
            >
              <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats row */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-8">
          <div className="grid grid-cols-3 gap-6 text-center divide-x divide-[#1e3a5f]">
            {[
              { val: '5', label: 'Free daily generations' },
              { val: 'MT5', label: 'Indicators only' },
              { val: 'Claude 3.5', label: 'AI model' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold text-[#00D4FF] mb-1">{s.val}</div>
                <div className="text-xs text-[#94a3b8]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 pb-24 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">
          Ready to build your first indicator?
        </h2>
        <p className="text-[#94a3b8] mb-8">
          Describe it. Generate it. Trade it.
        </p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 bg-[#00D4FF] text-[#0a0e1a] font-bold px-8 py-4 rounded-xl hover:bg-[#00b8d9] transition-all shadow-[0_0_25px_rgba(0,212,255,0.4)] text-base"
        >
          <Zap size={20} />
          Start Generating Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1e3a5f] py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#475569]">
          <span>
            Chart<span className="text-[#00D4FF]">inator</span> — AI-Powered MT5 Indicator Generator
          </span>
          <div className="flex gap-5">
            <Link href="/generate" className="hover:text-[#94a3b8] transition-colors">Generator</Link>
            <Link href="/dashboard" className="hover:text-[#94a3b8] transition-colors">Dashboard</Link>
            <Link href="/auth" className="hover:text-[#94a3b8] transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
