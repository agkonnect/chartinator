import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/supabase-server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/Navbar';
import DashboardClient from './client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/auth?redirect=/dashboard');

  const supabase = await createSupabaseServerClient();
  const { data: indicators } = await supabase
    .from('indicators')
    .select('id,name,description,indicator_type,timeframe,code,is_valid,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  const { data: usageData } = await supabase
    .rpc('get_daily_usage', { p_user_id: user.id });

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />
      <DashboardClient
        initialIndicators={indicators ?? []}
        initialUsage={typeof usageData === 'number' ? usageData : 0}
        userEmail={user.email ?? ''}
      />
    </div>
  );
}
