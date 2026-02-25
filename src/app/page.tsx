import { fetchPendingTasks, fetchActiveUsers } from '@/lib/actions';
import { QuickInput } from '@/components/forms/QuickInput';
import { RadarList } from '@/components/ui/RadarList';
import { InfoModal } from '@/components/ui/InfoModal';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const tasks = await fetchPendingTasks();
  const users = await fetchActiveUsers();

  return (
    <div className="flex min-h-screen items-start justify-center bg-white font-sans selection:bg-blue-100 selection:text-blue-900 pt-16 overflow-x-hidden w-full max-w-[100vw]">
      <main className="w-full max-w-2xl flex-col items-center justify-start py-10 px-4 sm:px-6 bg-transparent text-slate-900 overflow-x-hidden">
        <header className="mb-8 w-full flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-slate-900 rounded-xl mb-3 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <path d="M3 14h7v7H3z" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Controle
          </h1>
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
