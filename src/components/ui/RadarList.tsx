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

export type TaskWithSubtasks = Task & { subtasks?: Task[] };

export function RadarList({ initialTasks }: { initialTasks: TaskWithSubtasks[] }) {
    const [tasks, setTasks] = useState(initialTasks);
    const [now, setNow] = useState(new Date());

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Evita disparar drag sem querer ao clicar no item
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

                // Bulk update nas posições (A ordem visual vira lei absoluta, atualizando o Lexical DB)
                const updates = newArray.map((t, idx) => ({ id: t.id, position: idx }));
                updateTaskPositions(updates);

                return newArray;
            });
        }
    };

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
                <h2 className="text-xs font-mono tracking-widest text-slate-500 uppercase">System Radar</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-sm">[{tasks.length} THREADS]</span>
            </div>

            <DndContext
                id="main-radar-dnd-board"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-col border border-slate-200 bg-white rounded-lg overflow-hidden shadow-sm">
                    <SortableContext
                        items={tasks.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {tasks.map((task, index) => (
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
