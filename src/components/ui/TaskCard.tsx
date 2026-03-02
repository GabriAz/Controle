"use client"
import { Task } from '@prisma/client';
import { toggleTaskStatus, snoozeTask, addSubtask, toggleSubtask, updateTask, updateTaskPositions, deleteTask } from '@/lib/actions';
import { useRef, useState, useEffect } from 'react';
import { useSortable, SortableContext, arrayMove, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { TaskWithSubtasks } from './RadarList';

function SubtaskRow({ sub, sIndex, rank }: { sub: Task; sIndex: number; rank: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sub.id });
    const [isConfirming, setIsConfirming] = useState(false);
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 99 : 'auto',
    };
    return (
        <div ref={setNodeRef} style={style} className="flex items-start gap-2 py-0.5 hover:bg-slate-50 rounded-sm transition-colors group/sub">
            <div
                className="flex-shrink-0 pt-0.5 w-[28px] text-right cursor-grab active:cursor-grabbing hover:bg-slate-200 rounded-sm transition-colors text-slate-400 hover:text-slate-700"
                {...attributes}
                {...listeners}
                title="Drag to reorder subtask"
            >
                <span className="text-[10px] font-mono leading-none whitespace-nowrap">
                    {rank}.{sIndex + 1}
                </span>
            </div>
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
                <input
                    type="checkbox"
                    checked={sub.status === "COMPLETED"}
                    onChange={(e) => toggleSubtask(sub.id, e.target.checked)}
                    className="w-3 h-3 appearance-none border border-slate-300 rounded-[2px] checked:bg-blue-500 checked:border-blue-500 cursor-pointer transition-all shrink-0 bg-white"
                />
                <span className={`text-xs font-mono transition-all whitespace-pre-wrap break-words ${sub.status === "COMPLETED" ? 'text-slate-400 line-through' : 'text-slate-700 group-hover/sub:text-slate-900'}`}>
                    {sub.title}
                </span>
                {sub.assignee && (
                    <span className="text-[9px] font-mono bg-slate-100 text-slate-400 px-1 py-[1px] rounded-[2px] shrink-0 uppercase border border-slate-200 ml-auto mr-1 opacity-0 group-hover/sub:opacity-100 transition-opacity truncate max-w-[60px]" title={`Responsável: ${sub.assignee}`}>
                        {String(sub.assignee)}
                    </span>
                )}
                {isConfirming ? (
                    <div className="flex items-center gap-1.5 ml-auto shrink-0 bg-red-50/50 px-2 py-0.5 rounded-sm border border-red-100">
                        <span className="text-[9px] font-mono text-slate-500 mr-1">Apagar?</span>
                        <button type="button" onClick={async (e) => { e.stopPropagation(); e.preventDefault(); const res = await deleteTask(sub.id); if (res?.error) alert(res.error); setIsConfirming(false); }} className="px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white rounded-[2px] text-[9px] font-mono transition-colors">SIM</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsConfirming(false); }} className="px-2 py-0.5 bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-[2px] text-[9px] font-mono transition-colors">NÃO</button>
                    </div>
                ) : (
                    <button type="button" onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsConfirming(true);
                    }} className="opacity-100 md:opacity-0 md:group-hover/sub:opacity-100 min-h-[24px] min-w-[32px] flex items-center justify-center text-[9px] font-mono text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all ml-1 shrink-0" title="Excluir Subtarefa">DEL</button>
                )}
            </div>
        </div>
    );
}

import { useSession } from "next-auth/react";

export function TaskCard({ task, urgency, rank }: { task: TaskWithSubtasks, urgency: number, rank: number }) {
    const { data: session } = useSession();
    const currentUser = session?.user as any;
    const isMember = currentUser?.role === 'MEMBER';

    // ... existing logic ...
    const hoursLeft = (new Date(task.deadline).getTime() - new Date().getTime()) / 3600000;
    const formRef = useRef<HTMLFormElement>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Derived state for optimistic UI updates during Drag & Drop
    const [subtasksLocal, setSubtasksLocal] = useState(task.subtasks || []);

    // Sync external prop changes safely without useEffect cascading
    if (task.subtasks && JSON.stringify(task.subtasks) !== JSON.stringify(subtasksLocal) && !isEditing) {
        setSubtasksLocal(task.subtasks);
    }

    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const localSensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleSubtaskDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSubtasksLocal((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newArray = arrayMove(items, oldIndex, newIndex);
                const updates = newArray.map((t, idx) => ({ id: t.id, position: idx }));
                updateTaskPositions(updates);
                return newArray;
            });
        }
    };

    // Color-Coding Stress Clean White Style
    let bgClass = "bg-white border-b border-slate-100 hover:bg-slate-50";
    let titleClass = "text-slate-800";
    let priorColor = "text-slate-500";
    let uColor = "text-slate-400";

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    // Priority mappings
    const pLabel = `P${task.priority}`;
    if (task.priority === 1) priorColor = "text-red-500";
    if (task.priority === 2) priorColor = "text-orange-500";
    if (task.priority === 3) priorColor = "text-blue-500";

    if (hoursLeft <= 0.5) {
        bgClass = "bg-red-50 border-b border-red-100 hover:bg-red-100/50";
        titleClass = "text-red-700";
        uColor = "text-red-500/80";
    } else if (hoursLeft <= 3) {
        bgClass = "bg-orange-50/50 border-b border-orange-100 hover:bg-orange-50";
        titleClass = "text-orange-700";
        uColor = "text-orange-500/80";
    }

    if (isEditing) {
        const taskTime = new Date(task.deadline).toTimeString().substring(0, 5);
        const taskDate = new Date(task.deadline).toISOString().substring(0, 10);
        return (
            <div className="w-full border-b border-slate-200 bg-slate-50 p-2 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between pl-8 pr-2">
                    <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest">-- Edit Mode --</span>
                    <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
                <form action={async (formData) => { await updateTask(task.id, formData); setIsEditing(false); }} className="flex flex-col gap-2 pl-8 pr-2 pb-2">
                    <textarea name="title" defaultValue={task.title} className="w-full bg-white border border-slate-200 text-sm font-code text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 rounded-sm px-2 py-1.5 shadow-sm min-h-[44px] max-h-[300px] resize-y" required autoComplete="off" rows={2} />
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <input
                            type="text"
                            name="assignee"
                            defaultValue={(task as any).assignee as string}
                            placeholder="User"
                            className="w-20 bg-white border border-slate-200 text-xs font-mono font-bold text-slate-600 outline-none uppercase text-center rounded-sm px-1 py-1.5 shadow-sm disabled:opacity-75"
                            required
                            title="Responsável"
                            disabled={isMember}
                        />
                        {isMember && <input type="hidden" name="assignee" value={(task as any).assignee || ""} />}
                        <select name="priority" defaultValue={task.priority} className="w-24 bg-white border border-slate-200 text-xs font-mono text-slate-600 outline-none rounded-sm px-2 py-1.5 shadow-sm" required>
                            <option value="1">P1 [CRI]</option>
                            <option value="2">P2 [ALT]</option>
                            <option value="3">P3 [MED]</option>
                            <option value="4">P4 [BAX]</option>
                        </select>
                        <input type="date" name="date" defaultValue={taskDate} className="w-32 bg-white border border-slate-200 text-xs font-mono text-slate-600 outline-none rounded-sm px-2 py-1.5 shadow-sm [color-scheme:light]" required />
                        <input type="time" name="time" defaultValue={taskTime} className="w-24 bg-white border border-slate-200 text-xs font-mono text-slate-600 outline-none rounded-sm px-2 py-1.5 shadow-sm [color-scheme:light]" required />

                        <div className="flex-1 min-w-[10px]"></div>

                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-mono rounded-sm transition-colors">ESC</button>
                            <button type="submit" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded-sm transition-colors shadow-sm">SAVE</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} className={`w-full flex items-start gap-2 py-2 px-3 transition-colors group/main relative ${bgClass}`}>
            {/* Outline Hierarchy Number - DRAG HANDLE */}
            <div
                className="flex-shrink-0 pt-0.5 w-[32px] text-right cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-sm transition-colors"
                {...attributes}
                {...listeners}
                title="Drag to reorder"
            >
                <span className="text-[10px] font-mono font-bold leading-none whitespace-nowrap">
                    {rank} ::
                </span>
            </div>

            {/* Main Content Column */}
            <div className="flex flex-col flex-1 gap-1 min-w-0">
                {/* Row 1: Header */}
                <div className="flex items-start justify-between gap-2 overflow-hidden w-full">
                    <div className="flex flex-wrap sm:flex-nowrap items-center sm:items-start gap-x-2 gap-y-1 overflow-hidden min-w-0 flex-1">
                        <span className={`text-[10px] font-mono font-bold ${priorColor} shrink-0 sm:mt-0.5`}>[{pLabel}]</span>
                        <h3 className={`text-sm font-code whitespace-pre-wrap break-words min-w-0 ${titleClass}`}>{task.title}</h3>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 hidden sm:inline-block mt-1">#{task.taskRef.split('-')[1]}</span>
                        {(task as any).assignee && (
                            <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1 py-[1px] rounded-[2px] font-bold shrink-0 uppercase border border-slate-200 truncate max-w-[70px] sm:max-w-[80px]" title={`Responsável: ${(task as any).assignee}`}>
                                {(task as any).assignee}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-1 sm:ml-0 pt-0.5 sm:pt-0">
                        <span className={`text-[10px] font-mono ${uColor} hidden md:inline-block`}>U:{urgency.toFixed(2)}</span>
                        {/* Status/Deadline Indicator */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] font-mono ${hoursLeft <= 0.5 ? 'text-red-500 font-bold animate-pulse' : 'text-slate-400'}`}>
                                {hoursLeft <= 0 ? '[TIMEOUT]' : `[${new Date(task.deadline).toTimeString().substring(0, 5)}]`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Subtasks Tree */}
                {subtasksLocal && subtasksLocal.length > 0 && (
                    <div className="flex flex-col mt-0.5 mb-1.5">
                        <DndContext id={`subtask-dnd-board-${task.id}`} sensors={localSensors} collisionDetection={closestCenter} onDragEnd={handleSubtaskDragEnd}>
                            <SortableContext items={subtasksLocal.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                {subtasksLocal.map((sub, sIndex) => (
                                    <SubtaskRow key={sub.id} sub={sub} sIndex={sIndex} rank={rank} />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                )}

                {/* Footer Actions (Appears on Hover on Desktop, always visible on Mobile) */}
                <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2 mt-0.5 opacity-100 md:opacity-0 md:group-hover/main:opacity-100 transition-opacity w-full">
                    <form
                        ref={formRef}
                        action={async (formData) => {
                            await addSubtask(task.id, formData);
                            formRef.current?.reset();
                        }}
                        className="flex items-center gap-1.5 grow sm:flex-initial"
                    >
                        <span className="text-[10px] font-mono text-slate-300 shrink-0 ml-1 sm:ml-[26px]">└</span>
                        <input
                            type="text"
                            name="title"
                            placeholder="Add sub-thread..."
                            className="bg-transparent flex-1 min-w-[60px] sm:w-32 text-[10px] font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none border-b border-transparent focus:border-blue-300 pb-0.5 transition-colors"
                            required
                        />
                        <button type="submit" className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors shrink-0" title="Adicionar">
                            +ADD
                        </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-1 shrink-0 ml-auto sm:ml-0">
                        <button onClick={() => setIsEditing(true)} className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors shrink-0" title="Edit">EDT</button>
                        {hoursLeft <= 0.5 && (
                            <button onClick={() => { const reason = prompt("Justificativa para adiar (+2h):", ""); if (reason !== null) snoozeTask(task.id, 2); }} className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors shrink-0" title="Snooze 2h">SNZ</button>
                        )}
                        <button onClick={() => toggleTaskStatus(task.id, 'EXECUTING')} disabled={task.status === 'EXECUTING'} className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded disabled:opacity-50 transition-colors shrink-0" title="Execute">{task.status === 'EXECUTING' ? 'RUN' : 'EXC'}</button>
                        <button onClick={() => toggleTaskStatus(task.id, 'COMPLETED')} className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors shrink-0" title="Complete">END</button>

                        {isConfirmingDelete ? (
                            <div className="flex items-center gap-1.5 shrink-0 bg-red-50/80 px-2 py-0.5 rounded-sm border border-red-200 ml-1">
                                <span className="text-[9px] font-mono text-red-600 font-bold mr-1">Apagar Tudo?</span>
                                <button type="button" onClick={async (e) => { e.stopPropagation(); e.preventDefault(); const res = await deleteTask(task.id); if (res?.error) alert(res.error); setIsConfirmingDelete(false); }} className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-[2px] text-[9px] font-mono transition-colors">SIM</button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsConfirmingDelete(false); }} className="px-2 py-0.5 bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-[2px] text-[9px] font-mono transition-colors">NÃO</button>
                            </div>
                        ) : (
                            <button type="button" onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setIsConfirmingDelete(true);
                            }} className="min-h-[24px] min-w-[32px] flex items-center justify-center text-[10px] font-mono text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-1 shrink-0" title="Excluir Tarefa e Subtarefas">DEL</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
