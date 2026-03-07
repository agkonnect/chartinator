'use client';
import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GeneratorForm, { type GenerateResult } from '@/components/GeneratorForm';
import CodePreview from '@/components/CodePreview';
import UsageCounter from '@/components/UsageCounter';
import { getSupabaseClient } from '@/lib/supabase-client';
import { X, Zap, Lock, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const DAILY_LIMIT = 5;
const LS_KEY = 'chartinator_usage';

interface LocalUsage {
  date: string;
  count: number;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getLocalUsage(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return 0;
    const parsed: LocalUsage = JSON.parse(raw);
    return parsed.date === getTodayKey() ? parsed.count : 0;
  } catch {
    return 0;
  }
}

function incrementLocalUsage() {
  if (typeof window === 'undefined') return;
  const today = getTodayKey();
  const current = getLocalUsage();
  localStorage.setItem(LS_KEY, JSON.stringify({ date: today, count: current + 1 }));
}

function GeneratePageInner() {
  const searchParams = useSearchParams();
  const urlPrompt = searchParams.get('prompt') ?? '';

  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamingCode, setStreamingCode] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [usageLoading, setUsageLoading] = useState(true);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const streamRef = useRef<HTMLPreElement>(null);
  const supabase = getSupabaseClient();

  // Scroll to bottom of streaming pre as code arrives
  useEffect(() => {
    if (streamingCode && streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamingCode]);

  // Dynamic browser tab title
  useEffect(() => {
    document.title = result?.indicatorName
      ? result.indicatorName + '.mq5 — Chartinator'
      : 'Generate — Chartinator';
    return () => { document.title = 'Chartinator — AI-Powered MT5 Indicator Generator'; };
  }, [result]);

  // Load usage on mount
  const loadUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase.rpc('get_daily_usage', { p_user_id: session.user.id });
        if (!error && typeof data === 'number') {
          setUsageCount(data);
        } else {
          setUsageCount(getLocalUsage());
        }
      } else {
        setUsageCount(getLocalUsage());
      }
    } catch {
      setUsageCount(getLocalUsage());
    } finally {
      setUsageLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadUsage();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => loadUsage());
    return () => subscription.unsubscribe();
  }, [supabase, loadUsage]);

  const handleResult = async (res: GenerateResult) => {
    setStreamingCode('');
    setResult(res);
    incrementLocalUsage();
    setUsageCount((c) => c + 1);

    try {
      const sb = getSupabaseClient();
      const { data: { session } } = await sb.auth.getSession();
      if (session?.user) {
        const uid = session.user.id;
        await Promise.all([
          sb.from('indicators').insert({
            user_id: uid,
            name: res.indicatorName || 'Untitled',
            description: '',
            indicator_type: 'custom',
            timeframe: 'any',
            code: res.code,
            is_valid: res.valid,
          }),
          sb.from('usage_logs').insert({ user_id: uid }),
        ]);
        const { data: usageData } = await sb.rpc('get_daily_usage', { p_user_id: uid });
        if (typeof usageData === 'number') setUsageCount(usageData);
      }
    } catch (e) {
      console.error('Client-side save failed:', e);
    }

    setTimeout(() => {
      document.getElementById('code-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleRegenerate = () => {
    setResult(null);
    setStreamingCode('');
    setTimeout(() => {
      document.getElementById('generator-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      {showLimitModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLimitModal(false); }}
        >
          <div className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-8 max-w-md w-full text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-[#f59e0b]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Daily limit reached</h2>
            <p className="text-[#94a3b8] text-sm mb-6 leading-relaxed">
              You&apos;ve used all {DAILY_LIMIT} free generations for today.
              Sign in to get {DAILY_LIMIT} more free uses every day &mdash; saved to your dashboard.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/auth?redirect=/generate"
                className="flex items-center justify-center gap-2 bg-[#00D4FF] text-[#0a0e1a] font-bold py-3 rounded-xl hover:bg-[#00b8d9] transition-colors"
              >
                <Zap size={16} />
                Sign in for more free uses
              </Link>
              <button
                onClick={() => setShowLimitModal(false)}
                className="flex items-center justify-center gap-2 py-2.5 text-sm text-[#475569] hover:text-white transition-colors"
              >
                <X size={14} />Maybe later
              </button>
            </div>
            <p className="text-xs text-[#334155] mt-4">Resets at midnight UTC. No credit card required.</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h1 className="text-2xl font-extrabold text-white">
              Generate MT5 Indicator &#9889;
            </h1>
            <UsageCounter used={usageCount} limit={DAILY_LIMIT} loading={usageLoading} />
          </div>
          <p className="text-sm text-[#475569]">
            Describe your indicator in plain English &mdash; Claude AI will write the MQL5 code.
          </p>
        </div>

        <div id="generator-form" className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-6 mb-6 shadow-card">
          <GeneratorForm
            onResult={handleResult}
            onLoading={setLoading}
            onLimitReached={() => setShowLimitModal(true)}
            onStreamStart={() => { setStreamingCode(''); setResult(null); }}
            onStream={(chunk) => setStreamingCode((prev) => prev + chunk)}
            usageCount={usageCount}
            dailyLimit={DAILY_LIMIT}
            initialPrompt={urlPrompt}
          />
        </div>

        {/* Initial loading skeleton — before first byte */}
        {loading && streamingCode.length === 0 && (
          <div className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 border-2 border-[#1e3a5f] border-t-[#00D4FF] rounded-full animate-spin" />
              <span className="text-sm text-[#94a3b8]">Claude is writing your indicator...</span>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 rounded shimmer"
                  style={{ width: `${35 + Math.abs(Math.sin(i * 0.9) * 55)}%` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Live streaming code — as tokens arrive */}
        {loading && streamingCode.length > 0 && (
          <div className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 border-2 border-[#1e3a5f] border-t-[#00D4FF] rounded-full animate-spin" />
              <span className="text-sm text-[#94a3b8]">Writing MQL5 code...</span>
              <span className="ml-auto text-xs text-[#334155] font-mono">{streamingCode.length} chars</span>
            </div>
            <pre
              ref={streamRef}
              className="font-mono text-xs text-[#e2e8f0] bg-[#0d1117] rounded-xl p-4 overflow-auto max-h-[420px] leading-relaxed whitespace-pre-wrap"
            >{streamingCode}<span className="inline-block w-2 h-4 bg-[#00D4FF] animate-pulse ml-0.5 align-text-bottom" /></pre>
          </div>
        )}

        {/* Final result */}
        {result && (
          <div
            id="code-result"
            className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-6 animate-fade-in-up"
          >
            <CodePreview
              code={result.code}
              indicatorName={result.indicatorName}
              valid={result.valid}
              warnings={result.warnings}
            />
            <div className="mt-4 pt-4 border-t border-[#1e3a5f] flex justify-center">
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white border border-[#1e3a5f] hover:border-[#00D4FF]/40 px-5 py-2.5 rounded-xl transition-all"
              >
                <RefreshCw size={14} />
                Try a different prompt
              </button>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
            {[
              { tip: '&#128161; Be specific', desc: 'Mention colors, periods, thresholds and draw style for best results.' },
              { tip: '&#128202; Name the base', desc: 'E.g. "based on RSI" or "using EMA" helps Claude pick the right formula.' },
              { tip: '&#129695; Say where', desc: 'Tell Claude if it should appear on the chart or in a separate window.' },
            ].map((t) => (
              <div key={t.tip} className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-1" dangerouslySetInnerHTML={{ __html: t.tip }} />
                <p className="text-xs text-[#475569] leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    }>
      <GeneratePageInner />
    </Suspense>
  );
}
