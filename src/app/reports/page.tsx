import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
    const users = await prisma.user.findMany({
        where: { active: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    });

    // Handle Promises on Next 15+ searchParams dynamically
    const params = await searchParams;
    const userId = params?.user as string | undefined;
    const startDateStr = params?.start as string | undefined;
    const endDateStr = params?.end as string | undefined;

    let tasks: any[] = [];
    let queryExecuted = false;

    if (startDateStr && endDateStr) {
        queryExecuted = true;
        const start = new Date(startDateStr);
        // Usa o timezone base zerado
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDateStr);
        end.setHours(23, 59, 59, 999);

        const whereClause: any = {
            status: "COMPLETED",
            updatedAt: {
                gte: start,
                lte: end,
            }
        };

        if (userId && userId !== 'all') {
            whereClause.assigneeId = userId;
        }

        tasks = await prisma.task.findMany({
            where: whereClause,
            orderBy: { updatedAt: 'desc' },
            include: {
                SystemUser: { select: { name: true } }
            }
        });
    }

    return (
        <div className="flex min-h-screen items-start justify-center bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900 pt-16">
            <main className="w-full max-w-3xl flex-col items-center justify-start py-10 px-4 sm:px-6 bg-transparent text-slate-900">
                <header className="mb-8 w-full flex items-center justify-between text-left border-b border-slate-100 pb-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <span>Relatórios de Conclusão</span>
                        </h1>
                        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Análise Analítica de Atividades
                        </p>
                    </div>
                    <Link href="/" className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-sm border border-slate-200">
                        ← Voltar
                    </Link>
                </header>

                <div className="bg-slate-50 p-4 sm:p-6 rounded-lg border border-slate-200 mb-8 shadow-sm overflow-x-hidden">
                    <form className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full flex flex-col gap-1">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Responsável</label>
                            <select name="user" defaultValue={userId || 'all'} className="w-full h-9 bg-white border border-slate-200 text-xs font-mono text-slate-700 outline-none focus:border-emerald-400 rounded-sm px-2 shadow-sm">
                                <option value="all">TODOS OS USUÁRIOS</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 w-full flex flex-col gap-1">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Início</label>
                            <input type="date" name="start" required defaultValue={startDateStr} className="w-full h-9 bg-white border border-slate-200 text-xs font-mono text-slate-700 outline-none focus:border-emerald-400 rounded-sm px-2 shadow-sm" />
                        </div>
                        <div className="flex-1 w-full flex flex-col gap-1">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Fim</label>
                            <input type="date" name="end" required defaultValue={endDateStr} className="w-full h-9 bg-white border border-slate-200 text-xs font-mono text-slate-700 outline-none focus:border-emerald-400 rounded-sm px-2 shadow-sm" />
                        </div>
                        <div className="w-full sm:w-auto mt-2 sm:mt-0">
                            <button type="submit" className="w-full sm:w-auto h-9 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold tracking-widest uppercase rounded-sm transition-colors shadow-sm">
                                Filtrar
                            </button>
                        </div>
                    </form>
                </div>

                {queryExecuted && (
                    <div className="w-full">
                        <div className="mb-6 flex items-center justify-between bg-emerald-50 p-4 rounded border border-emerald-100">
                            <div>
                                <h3 className="text-sm font-bold text-emerald-900">Resultado do Período</h3>
                                <p className="text-[10px] font-mono text-emerald-700 mt-0.5 uppercase tracking-wide">
                                    {tasks.length} {tasks.length === 1 ? 'atividade finalizada' : 'atividades finalizadas'}
                                </p>
                            </div>
                        </div>

                        {tasks.length > 0 ? (
                            <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden">
                                {tasks.map((task: any, index: number) => (
                                    <div key={task.id} className={`flex flex-col sm:flex-row sm:items-start justify-between p-4 gap-3 sm:gap-0 ${index !== tasks.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors`}>
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            <div className="flex items-start sm:items-center gap-2">
                                                <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 py-[1px] rounded">
                                                    #{task.taskRef.split('-')[1]}
                                                </span>
                                                <h4 className="text-sm font-code font-semibold text-slate-800 break-words">{task.title}</h4>
                                            </div>
                                            {(task.SystemUser?.name || task.assignee) && (
                                                <div className="text-[10px] font-mono text-slate-500 uppercase mt-1 flex items-center gap-1">
                                                    <span className="text-emerald-600 font-bold">RESPONSÁVEL:</span> {task.SystemUser?.name || task.assignee}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0 mt-2 sm:mt-0 sm:ml-4 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                                            <span className="text-[10px] font-mono text-slate-400">
                                                {new Date(task.updatedAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[9px] font-mono bg-green-100 text-green-700 px-1.5 py-0.5 rounded-[2px] font-bold uppercase tracking-widest">
                                                Concluído
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-12 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                                    Nenhuma atividade encontrada neste período para o(s) usuário(s) selecionado(s).
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
