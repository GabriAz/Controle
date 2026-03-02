import { fetchPendingTasks, fetchActiveUsers } from '@/lib/actions';
import { QuickInput } from '@/components/forms/QuickInput';
import { RadarList } from '@/components/ui/RadarList';
import { InfoModal } from '@/components/ui/InfoModal';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const tasks = await fetchPendingTasks();
  const users = await fetchActiveUsers();

  return (
    <div className="flex min-h-screen items-start justify-center bg-white font-sans selection:bg-blue-100 selection:text-blue-900 pt-16 overflow-x-hidden w-full max-w-[100vw]">
      <main className="w-full max-w-2xl flex-col items-center justify-start py-10 px-4 sm:px-6 bg-transparent text-slate-900 overflow-x-hidden">
        <header className="mb-8 w-full flex flex-col items-center gap-1 text-center">
          <Image
            src="/logo.png"
            alt="Controle Logo"
            width={220}
            height={70}
            className="mb-2 object-contain h-auto"
            priority
          />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-1">
            Sistema de Alta Densidade
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6 w-full px-2">
            <Link href="/board" className="text-[10px] sm:text-xs font-mono font-bold uppercase text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-sm shrink-0">
              Painel Visual
            </Link>
            <Link href="/archive" className="text-[10px] sm:text-xs font-mono font-bold uppercase text-slate-500 hover:text-slate-800 transition-colors bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-sm shrink-0">
              The END (Arquivadas)
            </Link>
            <Link href="/reports" className="text-[10px] font-mono font-bold uppercase text-slate-500 hover:text-emerald-600 transition-colors bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-sm hidden sm:block">
              Relatórios
            </Link>
            <InfoModal />
          </div>
        </header>

        <QuickInput users={users} />
        <RadarList initialTasks={tasks} />
      </main>
    </div>
  );
}
