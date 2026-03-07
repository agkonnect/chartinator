'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, LayoutDashboard, Zap, Menu, X } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    // getSession() is instant (no network call) — avoids Netlify hang
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setMenuOpen(false)}
      className={`text-sm transition-colors ${
        pathname === href ? 'text-white font-semibold' : 'text-[#94a3b8] hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1e3a5f] bg-[#0a0e1a]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 18L9 12L13 16L21 7" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 7H21V14" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-bold text-white text-sm">
            Chart<span className="text-[#00D4FF]">inator</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLink('/generate', 'Generator')}
          {navLink('/examples', 'Examples')}
          {user && navLink('/dashboard', 'Dashboard')}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white transition-colors"
              >
                <LayoutDashboard size={14} />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#ef4444] transition-colors px-3 py-1.5 rounded-lg border border-[#1e3a5f] hover:border-[#ef4444]/40"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="text-sm text-[#94a3b8] hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/generate"
                className="flex items-center gap-1.5 text-sm font-semibold bg-[#00D4FF] text-[#0a0e1a] px-4 py-2 rounded-lg hover:bg-[#00b8d9] transition-colors"
              >
                <Zap size={14} />
                Try Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-[#94a3b8] hover:text-white p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#1e3a5f] bg-[#0a0e1a] px-4 py-4 space-y-3">
          {navLink('/generate', '⚡ Generator')}
          {navLink('/examples', '💡 Examples')}
          {user && navLink('/dashboard', '📊 Dashboard')}
          {user ? (
            <button
              onClick={() => { setMenuOpen(false); handleSignOut(); }}
              className="block text-sm text-[#ef4444]"
            >
              Sign out
            </button>
          ) : (
            <Link href="/auth" onClick={() => setMenuOpen(false)} className="block text-sm text-[#00D4FF]">
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
