import Navbar from '@/components/Navbar';
import ExamplesGrid from '@/components/ExamplesGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indicator Examples — Chartinator',
  description: 'Browse 15 ready-to-use MQL5 indicator prompts. One click to generate.',
};

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

        <ExamplesGrid />
      </div>
    </div>
  );
}
