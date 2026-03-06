'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase-client';

function AuthForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';
  const supabase = getSupabaseClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace(redirectTo);
    });
  }, [supabase, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (typeof window !== 'undefined' ? window.location.origin : '');
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });
    setLoading(false);
    if (authError) setError(authError.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#94a3b8] hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 18L9 12L13 16L21 7" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 7H21V14" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">
                Chart<span className="text-[#00D4FF]">inator</span>
              </span>
            </Link>
            <p className="text-[#475569] text-sm">Describe it. Generate it. Trade it.</p>
          </div>

          {/* Card */}
          <div className="bg-[#111827] border border-[#1e3a5f] rounded-2xl p-8 shadow-card">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-[#10b981]/10 border border-[#10b981]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={30} className="text-[#10b981]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
                <p className="text-[#94a3b8] text-sm leading-relaxed mb-6">
                  Magic link sent to{' '}
                  <span className="text-white font-semibold">{email}</span>.
                  <br />Click the link to sign in — it expires in 1 hour.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="text-sm text-[#00D4FF] hover:underline"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-1">Sign in to Chartinator</h2>
                <p className="text-sm text-[#475569] mb-6">
                  No password needed — we'll email you a magic link.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#94a3b8] font-semibold uppercase tracking-wider mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(null); }}
                        placeholder="you@example.com"
                        autoFocus
                        disabled={loading}
                        className="w-full bg-[#0d1117] border border-[#1e3a5f] rounded-xl pl-10 pr-4 py-3
                          text-white placeholder-[#334155] text-sm focus:outline-none
                          focus:border-[#00D4FF] focus:shadow-[0_0_0_1px_rgba(0,212,255,0.2)]
                          transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl">
                      <AlertCircle size={14} className="text-[#ef4444] flex-shrink-0" />
                      <p className="text-xs text-[#ef4444]">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                      loading || !email
                        ? 'bg-[#1a2235] text-[#475569] cursor-not-allowed border border-[#1e3a5f]'
                        : 'bg-[#00D4FF] text-[#0a0e1a] hover:bg-[#00b8d9] shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0a0e1a]/30 border-t-[#0a0e1a] rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <><Mail size={15} /> Send Magic Link</>
                    )}
                  </button>
                </form>

                <p className="text-xs text-[#334155] text-center mt-5">
                  By signing in you agree to our terms. Stored securely with Supabase.
                </p>
              </>
            )}
          </div>

          {/* Perks row */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { icon: '⚡', label: '5 free/day' },
              { icon: '💾', label: 'Save history' },
              { icon: '📥', label: 'Quick download' },
            ].map((p) => (
              <div
                key={p.label}
                className="bg-[#111827] border border-[#1e3a5f] rounded-xl p-3 text-center"
              >
                <div className="text-base mb-1">{p.icon}</div>
                <p className="text-xs text-[#475569]">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1e3a5f] border-t-[#00D4FF] rounded-full animate-spin" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
