'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, BarChart2, Clock, Search } from 'lucide-react';
import IndicatorHistory, { type IndicatorRecord } from '@/components/IndicatorHistory';
import UsageCounter from '@/components/UsageCounter';
import Navbar from '@/components/Navbar';
import { getSupabaseClient } from '@/lib/supabase-client';

export default function DashboardClient() {
  const [indicators, setIndicators] = useState<IndicatorRecord[]>([]);
  const [usage, setUsage] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    async function init() {
      try {
        // 1. Check session — instant from localStorage
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.replace('/auth?redirect=/dashboard');
          return;
        }
        const user = session.user;
        setUserEmail(user.email ?? '');

        // 2. Fetch indicators with timeout
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          const { data: inds } = await supabase
            .from('indicators')
            .select('id,name,description,indicator_type,timeframe,code,is_valid,created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100)
            .abortSignal(controller.signal);
          clearTimeout(timer);
          setIndicators(inds ?? []);
        } catch (e) {
          console.error('Failed to load indicators:', e);
          setIndicators([]);
        }

        // 3. Fetch usage with timeout
        try {
          const { data: usageData } = await Promise.race([
            supabase.rpc('get_daily_usage', { p_user_id: user.id }),
            new Promise<{ data: null }>((resolve) => setTimeout(() => resolve({ data: null }), 5000)),
          ]);
          setUsage(typeof usageData === 'number' ? usageData : 0);
        } catch (e) {
          console.error('Failed to load usage:', e);
          setUsage(0);
        }
      } catch (e) {
        console.error('Dashboard init error:', e);
      } finally {
        setLoading(false);
      }
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await supabase.from('indicators').delete().eq('id', id);
      setIndicators((prev) => prev.filter((ind) => ind.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const handleRename = async (id: string, newName: string) => {
    await supabase.from('indicators').update({ name: newName }).eq('id', id);
    setIndicators((prev) =>
      prev.map((ind) => ind.id === id ? { ...ind, name: newName } : ind)
    );
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return indicators;
    const q = search.toLowerCase();
    return indicators.filter((ind) =>
      ind.name.toLowerCase().includes(q) ||
      (ind.description ?? '').toLowerCase().includes(q)
    );
  }, [indicators, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-[#00D4FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#475569] text-sm">Loading your indicators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white mb-1">My Indicators</h1>
            <p className="text-sm text-[#475569]">Signed in as <span className="text-[#94a3b8]">{userEmail}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <UsageCounter used={usage} limit={5} />
            <Link href="/generate" className="flex items-center gap-2 bg-[#00D4FF] text-[#0a0e1a] font-bold px-4 py-2.5 rounded-xl hover:bg-[#00b8d9] transition-colors text-sm shadow-[0_0_15px_rgba(0,212,255,0.25)]">
              <Zap size={15} />New Indicator
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: <BarChart2 size={18} className="text-[#00D4FF]" />, label: 'Total Generated', value: indicators.length },
            { icon: <Zap size={18} className="text-[#10b981]" />, label: 'Used Today', value: usage },
            { icon: <Clock size={18} className="text-[#94a3b8]" />, label: 'Free Remaining', value: Math.max(0, 5 - usage) },
          ].map((s) => (
            <div key={s.label} className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1a2235] flex items-center justify-center flex-shrink-0">{s.icon}</div>
              <div>
                <div className="text-xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-[#475569]">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search bar */}
        {indicators.length > 0 && (
          <div className="relative mb-6">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search indicators by name..."
              className="w-full bg-[#111827] border border-[#1e3a5f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#e2e8f0] placeholder-[#334155] focus:outline-none focus:border-[#00D4FF] transition-colors"
            />
            {search && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#475569]">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Indicator grid */}
        <IndicatorHistory
          indicators={filtered}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      </div>
    </div>
  );
}
