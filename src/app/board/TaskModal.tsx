"use client"
import { Task } from '@prisma/client';
import { calculateUrgency } from '@/lib/utils/urgency';

type TaskWithSubtasks = Task & { subtasks?: Task[], Creator?: { name: string } };

interface TaskModalProps {
    // ... existing props ...
    task: TaskWithSubtasks;
    onClose: () => void;
    now: Date;
}

export function TaskModal({ task, onClose, now }: TaskModalProps) {
    // ... existing logic ... (matching for tool)
    const hoursLeft = (new Date(task.deadline).getTime() - now.getTime()) / 3600000;
    const urgency = calculateUrgency(task.priority, task.deadline, now);

    let priorColor = "text-slate-500";
    let priorBg = "bg-slate-100";
    const pLabel = `P${task.priority}`;

    if (task.priority === 1) { priorColor = "text-red-600"; priorBg = "bg-red-50 border-red-200"; }
    if (task.priority === 2) { priorColor = "text-orange-600"; priorBg = "bg-orange-50 border-orange-200"; }
    if (task.priority === 3) { priorColor = "text-blue-600"; priorBg = "bg-blue-50 border-blue-200"; }

    let timeColor = "text-slate-600";
    if (hoursLeft <= 0.5) timeColor = "text-red-600 font-bold";
    else if (hoursLeft <= 3) timeColor = "text-orange-600";

    const taskDateFormatted = new Date(task.deadline).toLocaleDateString('pt-BR');
    const taskTimeFormatted = new Date(task.deadline).toTimeString().substring(0, 5);
    const createdDate = new Date(task.createdAt).toLocaleDateString('pt-BR');

    // Tolerance of 2 seconds to avoid false-alarms on creation DB lag
    const isEdited = new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime() > 2000;

    // Calculate subtask completion
    const totalSubs = task.subtasks?.length || 0;
    const completedSubs = task.subtasks?.filter(s => s.status === 'COMPLETED').length || 0;
    const progressPerc = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header Section */}
                <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className="text-[10px] font-mono bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded shadow-sm">
                                {task.taskRef}
                            </span>
                            <span className={`text-[10px] font-mono border px-1.5 py-0.5 rounded shadow-sm font-bold ${priorBg} ${priorColor}`}>
                                {pLabel} Urgency: {urgency.toFixed(2)}
                            </span>
                            <span className="text-[10px] font-mono bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded shadow-sm">
                                STATUS: {task.status}
                            </span>
                            {isEdited && (
                                <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-200 text-indigo-600 px-1.5 py-0.5 rounded shadow-sm font-bold tracking-wide" title="Essa tarefa foi alterada após a criação">
                                    ✏️ EDITADA
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 font-code leading-tight mt-1">{task.title}</h2>
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Fechar Modal"
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0 shadow-sm"
                        title="Fechar (Esc)"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6">

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Responsável</span>
                            <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500 border border-slate-300">
                                    {((task as any).assignee || 'UN').substring(0, 2).toUpperCase()}
                                </div>
                                <span className="truncate">{(task as any).assignee || 'Unassigned'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Criado por</span>
                            <div className="text-sm font-medium text-slate-600">
                                {task.Creator?.name || 'Sistema'}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Prazo Final</span>
                            <div className={`text-sm font-mono ${timeColor}`}>
                                {taskDateFormatted} <span className="text-xs text-slate-500">{taskTimeFormatted}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Criada em</span>
                            <div className="text-sm font-mono text-slate-600">
                                {createdDate}
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-slate-100"></div>

                    {/* Subtasks Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                                Estrutura da Tarefa (Sub-threads)
                            </h3>
                            {totalSubs > 0 && (
                                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">
                                    {completedSubs} / {totalSubs} ({progressPerc}%)
                                </span>
                            )}
                        </div>

                        {totalSubs === 0 ? (
                            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-6 text-center">
                                <p className="text-xs font-mono text-slate-400">Nenhuma sub-tarefa atrelada a esta raiz.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 border border-slate-100 rounded-lg bg-slate-50/50 p-2">
                                {task.subtasks?.map((sub, idx) => (
                                    <div key={sub.id} className={`flex items-start gap-3 p-2.5 rounded-md border ${sub.status === 'COMPLETED' ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                        <div className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${sub.status === 'COMPLETED' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-slate-300'}`}>
                                            {sub.status === 'COMPLETED' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className={`text-sm font-code ${sub.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                                                {sub.title}
                                            </span>
                                            {sub.assignee && (
                                                <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-wider before:content-['Responsável:_']">
                                                    {String(sub.assignee)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-mono font-bold rounded shadow-sm transition-colors"
                    >
                        FECHAR
                    </button>
                    {/* The Edit functionality on the board is handled by the inline TaskCard right now, keeping this modal as a Viewer like asked ("painel visual para mostrar infos") */}
                </div>
            </div>
        </div>
    );
}
