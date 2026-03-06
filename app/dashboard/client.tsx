'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Zap, BarChart2, Clock, Trash2 } from 'lucide-react';
import IndicatorHistory, { type IndicatorRecord } from '@/components/IndicatorHistory';
import UsageCounter from '@/components/UsageCounter';
import { getSupabaseClient } from '@/lib/supabase-client';

interface Props {
  initialIndicators: IndicatorRecord[];
  initialUsage: number;
  userEmail: string;
}

export default function DashboardClient({ initialIndicators, initialUsage, userEmail }: Props) {
  const [indicators, setIndicators] = useState<IndicatorRecord[]>(initialIndicators);
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await supabase.from('indicators').delete().eq('id', id);
      setIndicators((prev) => prev.filter((ind) => ind.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">My Indicators</h1>
          <p className="text-sm text-[#475569]">
            Signed in as <span className="text-[#94a3b8]">{userEmail}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UsageCounter used={initialUsage} limit={5} />
          <Link
            href="/generate"
            className="flex items-center gap-2 bg-[#00D4FF] text-[#0a0e1a] font-bold px-4 py-2.5 rounded-xl
              hover:bg-[#00b8d9] transition-colors text-sm shadow-[0_0_15px_rgba(0,212,255,0.25)]"
          >
            <Zap size={15} />
            New Indicator
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: <BarChart2 size={18} className="text-[#00D4FF]" />,
            label: 'Total Generated',
            value: indicators.length,
          },
          {
            icon: <Zap size={18} className="text-[#10b981]" />,
            label: 'Used Today',
            value: initialUsage,
          },
          {
            icon: <Clock size={18} className="text-[#94a3b8]" />,
            label: 'Free Remaining',
            value: Math.max(0, 5 - initialUsage),
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1a2235] flex items-center justify-center flex-shrink-0">
              {s.icon}
            </div>
            <div>
              <div className="text-xl font-extrabold text-white">{s.value}</div>
              <div className="text-xs text-[#475569]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicator grid */}
      <IndicatorHistory
        indicators={indicators}
        onDelete={handleDelete}
      />
    </div>
  );
}
