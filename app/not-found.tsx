import Link from 'next/link';
import { Zap, Home, TrendingUp } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00D4FF]/5 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-[#00D4FF]/10 rounded-lg flex items-center justify-center border border-[#00D4FF]/20">
            <TrendingUp size={16} className="text-[#00D4FF]" />
          </div>
          <span className="font-bold text-sm">
            Chart<span className="text-[#00D4FF]">inator</span>
          </span>
        </Link>

        {/* 404 */}
        <div className="mb-6">
          <span className="text-[120px] font-black leading-none bg-gradient-to-b from-[#00D4FF] to-[#00D4FF]/20 bg-clip-text text-transparent select-none">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Indicator Not Found
        </h1>
        <p className="text-[#64748b] mb-10 leading-relaxed">
          This page doesn&apos;t exist — but your next MQL5 indicator does.<br />
          Let&apos;s generate it.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 bg-[#00D4FF] text-[#0a0e1a] font-bold px-6 py-3 rounded-xl hover:bg-[#00b8d9] transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)] text-sm"
          >
            <Zap size={16} />
            Start Generating
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-[#1e3a5f] text-[#94a3b8] font-medium px-6 py-3 rounded-xl hover:border-[#00D4FF]/30 hover:text-white transition-all text-sm"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Subtle code comment decoration */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#1e3a5f] text-xs font-mono select-none whitespace-nowrap">
        {'// OnCalculate() returned 0 — page not found'}
      </div>
    </div>
  );
}
