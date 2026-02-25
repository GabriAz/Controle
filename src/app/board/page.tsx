import { fetchPendingTasks } from '@/lib/actions';
import Link from "next/link";
import { BoardColumns } from './BoardColumns';

export const dynamic = 'force-dynamic';

export default async function BoardPage() {
    const tasks = await fetchPendingTasks();

    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const weekEnd = new Date(now);
    const daysUntilSunday = 7 - now.getDay();
    weekEnd.setDate(now.getDate() + daysUntilSunday);
    weekEnd.setHours(23, 59, 59, 999);

    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const todayTasks = tasks.filter(t => new Date(t.deadline) <= todayEnd);
    const weekTasks = tasks.filter(t => new Date(t.deadline) > todayEnd && new Date(t.deadline) <= weekEnd);
    const monthTasks = tasks.filter(t => new Date(t.deadline) > weekEnd && new Date(t.deadline) <= monthEnd);
    const laterTasks = tasks.filter(t => new Date(t.deadline) > monthEnd);

    return (
        <div className="flex min-h-screen items-start justify-center bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 pt-16">
            <main className="w-full max-w-7xl flex-col items-center justify-start pb-10 pt-6 px-4 sm:px-6 text-slate-900 mb-10">
                <header className="mb-6 w-full flex items-center justify-between text-left bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            Painel Visual
                        </h1>
                        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Planejamento por Volume de Tempo
                        </p>
                    </div>
                    <Link href="/" className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-sm border border-slate-200 shadow-sm">
                        ← Voltar ao Radar
                    </Link>
                </header>

                <BoardColumns
                    todayTasks={todayTasks}
                    weekTasks={weekTasks}
                    monthTasks={monthTasks}
                    laterTasks={laterTasks}
                />
            </main>
        </div>
    );
}
