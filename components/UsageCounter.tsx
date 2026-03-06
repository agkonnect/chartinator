'use client';
import { Zap } from 'lucide-react';

interface Props {
  used: number;
  limit?: number;
  loading?: boolean;
}

export default function UsageCounter({ used, limit = 5, loading = false }: Props) {
  const remaining = Math.max(0, limit - used);
  const pct = Math.min(100, (used / limit) * 100);
  const color =
    remaining === 0 ? '#ef4444' : remaining <= 1 ? '#f59e0b' : '#00D4FF';

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#111827] border border-[#1e3a5f] rounded-xl">
        <div className="w-28 h-3 bg-[#1a2235] rounded-full shimmer" />
        <div className="w-16 h-3 bg-[#1a2235] rounded-full shimmer" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-[#111827] border border-[#1e3a5f] rounded-xl">
      <Zap size={14} style={{ color }} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#94a3b8]">
            <span className="font-bold" style={{ color }}>{remaining}</span>
            <span className="text-[#475569]"> / {limit} free uses today</span>
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#1a2235] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}
