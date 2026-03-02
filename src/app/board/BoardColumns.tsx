"use client"
import { Task } from '@prisma/client';
import { calculateUrgency } from '@/lib/utils/urgency';
import { useEffect, useState } from 'react';
import { TaskModal } from './TaskModal';
import { useSession } from "next-auth/react";

type TaskWithSubtasks = Task & { subtasks?: Task[], Creator?: { name: string } | null };

function BoardCard({ task, urgency, onTaskClick }: { task: TaskWithSubtasks, urgency: number, onTaskClick: (t: TaskWithSubtasks) => void }) {
    // ... existing card code ... (keeping it for the tool to match)
    const hoursLeft = (new Date(task.deadline).getTime() - new Date().getTime()) / 3600000;

    let bgClass = "bg-white border hover:border-slate-300 border-slate-200 cursor-pointer";
    let titleClass = "text-slate-800";
    let priorColor = "text-slate-500";

    const pLabel = `P${task.priority}`;
    if (task.priority === 1) priorColor = "text-red-500";
    if (task.priority === 2) priorColor = "text-orange-500";
    if (task.priority === 3) priorColor = "text-blue-500";

    if (hoursLeft <= 0.5) {
        bgClass = "bg-red-50 border-red-200 cursor-pointer";
        titleClass = "text-red-700";
    } else if (hoursLeft <= 3) {
        bgClass = "bg-orange-50/50 border-orange-200 cursor-pointer";
        titleClass = "text-orange-700";
    }

    const taskDateFormatted = new Date(task.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const taskTimeFormatted = new Date(task.deadline).toTimeString().substring(0, 5);

    return (
        <div
            className={`p-3 rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors ${bgClass} flex flex-col gap-1 group`}
            onClick={() => onTaskClick(task)}
        >
            <div className="flex items-start justify-between gap-2 overflow-hidden w-full">
                <div className="flex items-start gap-1">
                    <span className={`text-[9px] font-mono font-bold ${priorColor} mt-0.5`}>[{pLabel}]</span>
                    <h3 className={`text-xs font-code font-semibold ${titleClass} whitespace-pre-wrap break-words leading-tight`}>{task.title}</h3>
                </div>
            </div>

            {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-1 flex items-center gap-1">
                    <span className="text-[10px] font-mono text-slate-400">└</span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                        {task.subtasks.length} sub
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between mt-1">
                {(task as any).assignee ? (
                    <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1 py-[1px] rounded-[2px] font-bold uppercase border border-slate-200 max-w-[80px] truncate">
                        {(task as any).assignee}
                    </span>
                ) : <span />}

                <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono bg-white px-1 py-0.5 rounded border border-slate-200 ${hoursLeft <= 0.5 ? 'text-red-600 font-bold border-red-200' : 'text-slate-500'}`}>
                        {hoursLeft <= 0 ? '[TIMEOUT]' : `${taskDateFormatted} - ${taskTimeFormatted}`}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function BoardColumns({ todayTasks, weekTasks, monthTasks, laterTasks }: { todayTasks: TaskWithSubtasks[], weekTasks: TaskWithSubtasks[], monthTasks: TaskWithSubtasks[], laterTasks: TaskWithSubtasks[] }) {
    const { data: session } = useSession();
    const [now, setNow] = useState(new Date());
    const [selectedTask, setSelectedTask] = useState<TaskWithSubtasks | null>(null);
    const [showOnlyMine, setShowOnlyMine] = useState(false);

    const currentUser = session?.user as any;
    const canSeeOthers = currentUser?.canSeeOthersTasks !== false;

    useEffect(() => {
        if (!canSeeOthers) {
            setShowOnlyMine(true);
        }
    }, [canSeeOthers]);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const filterTasks = (tasks: TaskWithSubtasks[]) => {
        if (!showOnlyMine || !session?.user) return tasks;
        const currentUserId = (session.user as any).id;
        return tasks.filter(t => t.assigneeId === currentUserId);
    };

    const Column = ({ title, tasks, color }: { title: string, tasks: TaskWithSubtasks[], color: string }) => {
        const filteredTasks = filterTasks(tasks);
        return (
            <div className="flex-1 w-[85vw] sm:w-auto min-w-[280px] sm:min-w-[300px] bg-slate-100/60 rounded-lg border border-slate-200 p-3 flex flex-col gap-3 shadow-inner snap-center sm:snap-none shrink-0">
                <div className={`text-xs font-mono font-bold uppercase tracking-widest ${color} border-b border-slate-200 pb-2 flex justify-between items-center`}>
                    <span>{title}</span>
                    <span className="bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-sm shadow-sm leading-none">{filteredTasks.length}</span>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto pr-1 pb-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 240px)' }}>
                    {filteredTasks.length === 0 ? (
                        <div className="text-[10px] font-mono text-center text-slate-400 py-6 uppercase tracking-widest border border-dashed border-slate-300 rounded bg-slate-50/50">Nenhuma Tarefa</div>
                    ) : (
                        filteredTasks.map(t => (
                            <BoardCard key={t.id} task={t} urgency={calculateUrgency(t.priority, t.deadline, now)} onTaskClick={setSelectedTask} />
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4">
            {canSeeOthers ? (
                <div className="flex items-center gap-2 mb-2">
                    <button
                        onClick={() => setShowOnlyMine(!showOnlyMine)}
                        className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded border transition-all ${showOnlyMine
                            ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {showOnlyMine ? '👀 Minhas Tarefas' : '🌍 Todas as Tarefas'}
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded shadow-sm flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Visualizando: Apenas Minhas Tarefas
                    </span>
                </div>
            )}

            <div aria-label="Task board" className="w-full flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                <Column title="Para Hoje" tasks={todayTasks} color="text-red-600" />
                <Column title="Esta Semana" tasks={weekTasks} color="text-orange-600" />
                <Column title="Este Mês" tasks={monthTasks} color="text-blue-600" />
                {(laterTasks.length > 0) && <Column title="Futuro" tasks={laterTasks} color="text-slate-500" />}

                {selectedTask && (
                    <TaskModal
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                        now={now}
                    />
                )}
            </div>
        </div>
    );
}
