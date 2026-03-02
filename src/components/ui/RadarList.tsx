"use client"
import { useEffect, useState } from 'react';
import { Task } from '@prisma/client';
import { TaskCard } from './TaskCard';
import { calculateUrgency } from '@/lib/utils/urgency';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { updateTaskPositions } from '@/lib/actions';

import { useSession } from "next-auth/react";

export type TaskWithSubtasks = Task & { subtasks?: Task[] };

export function RadarList({ initialTasks }: { initialTasks: TaskWithSubtasks[] }) {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState(initialTasks);
    const [now, setNow] = useState(new Date());
    const [showOnlyMine, setShowOnlyMine] = useState(false);

    const currentUser = session?.user as any;
    const canSeeOthers = currentUser?.canSeeOthersTasks !== false;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (!canSeeOthers) {
            setShowOnlyMine(true);
        }
    }, [canSeeOthers]);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setTasks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newArray = arrayMove(items, oldIndex, newIndex);
                const updates = newArray.map((t, idx) => ({ id: t.id, position: idx }));
                updateTaskPositions(updates);
                return newArray;
            });
        }
    };

    const filterTasks = (taskList: TaskWithSubtasks[]) => {
        if (!showOnlyMine || !session?.user) return taskList;
        const currentUserId = (session.user as any).id;
        return taskList.filter(t => t.assigneeId === currentUserId);
    };

    const displayedTasks = filterTasks(tasks);

    if (displayedTasks.length === 0 && tasks.length > 0 && showOnlyMine) {
        return (
            <div className="w-full mt-4">
                <div className="flex items-center justify-between mb-2 px-2 border-b border-slate-200 pb-2">
                    <h2 className="text-xs font-mono tracking-widest text-slate-500 uppercase">System Radar</h2>
                    <button
                        onClick={() => setShowOnlyMine(false)}
                        className="text-[9px] font-mono px-2 py-0.5 bg-white border border-slate-200 text-slate-500 rounded-sm hover:bg-slate-50"
                    >
                        🌍 Ver Tudo
                    </button>
                </div>
                <div className="w-full p-8 text-center border border-slate-200 bg-slate-50 rounded-lg">
                    <h3 className="text-sm font-mono tracking-tight text-slate-400 uppercase">Nenhuma tarefa atribuída a você</h3>
                </div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="w-full mt-6 p-8 text-center border-t border-b border-slate-200 bg-slate-50">
                <div className="flex justify-center mb-3 text-slate-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <h3 className="text-sm font-mono tracking-tight text-slate-500 mb-1">RADAR_STANDBY</h3>
            </div>
        );
    }

    return (
        <div aria-label="Radar list" className="w-full flex flex-col mt-4">
            <div className="flex items-center justify-between mb-2 px-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-xs font-mono tracking-widest text-slate-500 uppercase">System Radar</h2>
                    {canSeeOthers ? (
                        <button
                            onClick={() => setShowOnlyMine(!showOnlyMine)}
                            className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border transition-all ${showOnlyMine
                                ? 'bg-blue-600 text-white border-blue-700'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {showOnlyMine ? '👀 Só as Minhas' : '🌍 Todas'}
                        </button>
                    ) : (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded">
                            MISSAO_PESSOAL
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-sm">[{displayedTasks.length} THREADS]</span>
            </div>

            <DndContext
                id="main-radar-dnd-board"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-col border border-slate-200 bg-white rounded-lg overflow-hidden shadow-sm">
                    <SortableContext
                        items={displayedTasks.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {displayedTasks.map((task, index) => (
                            <TaskCard
                                key={task.id}
                                task={task as TaskWithSubtasks}
                                urgency={calculateUrgency(task.priority, task.deadline, now)}
                                rank={index + 1}
                            />
                        ))}
                    </SortableContext>
                </div>
            </DndContext>
        </div>
    );
}
