import { fetchArchivedTasks } from '@/lib/actions';
import Link from "next/link";
import { Task } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function ArchivePage() {
    const tasks = await fetchArchivedTasks();

    return (
        <div className="flex min-h-screen items-start justify-center bg-white font-sans selection:bg-slate-100 selection:text-slate-900 pt-16">
            <main className="w-full max-w-2xl border border-slate-200 bg-white rounded-lg shadow-sm flex-col items-center justify-start pb-10 pt-6 px-4 sm:px-6 text-slate-900 mb-10">
                <header className="mb-8 w-full flex items-center justify-between text-left">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <span> THE END</span>
                        </h1>
                        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Arquivo morto de tarefas concluídas
                        </p>
                    </div>
                    <Link href="/" className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-sm border border-slate-200 shadow-sm">
                        ← Voltar
                    </Link>
                </header>

                <div className="w-full flex flex-col gap-0 border-t border-slate-200">
                    {tasks.length === 0 && (
                        <div className="p-8 text-center text-slate-400 font-mono text-xs uppercase tracking-widest">
                            [Nenhum registro encontrado]
                        </div>
                    )}
                    {tasks.map((task: any) => (
                        <div key={task.id} className="w-full flex items-start flex-col gap-1 py-3 px-3 border-b border-slate-100 bg-slate-50">
                            <div className="flex w-full items-start justify-between">
                                <div className="flex items-start gap-2">
                                    <h3 className="text-xs font-mono font-bold text-slate-500 line-through decoration-slate-300">
                                        {task.title}
                                    </h3>
                                    {task.assignee && (
                                        <span className="text-[9px] font-mono bg-slate-200 text-slate-400 px-1 py-[1px] rounded-[2px] font-bold shrink-0 uppercase border border-slate-300">
                                            {task.assignee}
                                        </span>
                                    )}
                                </div>
                                <div className="flex shrink-0 items-center gap-2 text-right">
                                    <span className="text-[9px] font-mono text-slate-400">
                                        Concluída: {new Date(task.updatedAt).toLocaleDateString()}
                                    </span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-green-100 text-green-700 rounded-sm">COMPLETED</span>
                                </div>
                            </div>
                            {task.subtasks?.length > 0 && (
                                <div className="flex flex-col gap-1 ml-4 mt-2 border-l border-slate-200 pl-2">
                                    {task.subtasks.map((sub: any) => (
                                        <div key={sub.id} className="flex justify-between items-center bg-white border border-slate-200 px-2 py-1 rounded-sm w-full">
                                            <span className="text-[10px] font-mono text-slate-400 decoration-slate-300 line-through">
                                                {sub.title}
                                            </span>
                                            <span className="text-[9px] font-mono bg-green-50 text-green-600 px-1 py-[1px] rounded-[2px] uppercase border border-green-200">
                                                ✓
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
