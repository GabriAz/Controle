"use client"
import { useActionState, useEffect, useRef, useState } from 'react';
import { createTaskAction } from '@/lib/actions';
import { useSession } from "next-auth/react";

export function QuickInput({ users = [] }: { users?: { id: string; name: string }[] }) {
    const { data: session } = useSession();
    const [state, action, pending] = useActionState(createTaskAction, null);
    const formRef = useRef<HTMLFormElement>(null);

    const currentUser = session?.user as any;
    const isMember = currentUser?.role === 'MEMBER';

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
        }
    }, [state]);

    // Use current date as default to prevent silent HTML5 block
    const today = new Date().toISOString().substring(0, 10);

    return (
        <div className="w-full relative bg-white border border-slate-200 rounded-xl p-3 mb-8 transition-all focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400/20 shadow-sm">
            <form ref={formRef} action={action} className="w-full flex flex-col gap-3">
                <textarea
                    name="title"
                    placeholder="[+] Inserir nova diretriz no Radar..."
                    className="w-full bg-transparent text-sm font-code text-slate-800 placeholder:text-slate-400 focus:outline-none px-2 py-2 min-h-[44px] max-h-[300px] resize-y border-b border-slate-100"
                    disabled={pending}
                    required
                    autoComplete="off"
                    rows={2}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            formRef.current?.requestSubmit();
                        }
                    }}
                />

                <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-y-3 gap-x-2 mt-2">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 flex-1 w-full shrink-0">
                        <div className="w-full sm:w-24 bg-slate-50 border border-slate-200 rounded-md overflow-hidden relative h-9 shrink-0 focus-within:border-blue-400 hover:bg-slate-100 transition-colors">
                            <select
                                name="assigneeId"
                                className="w-full h-full appearance-none bg-transparent text-[11px] font-mono font-bold text-slate-800 outline-none cursor-pointer pl-2 pr-6 disabled:opacity-70"
                                required
                                title="Responsável"
                                defaultValue={isMember ? currentUser.id : ""}
                                disabled={isMember || pending}
                            >
                                <option value="">User...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            {/* Se for membro, precisamos enviar o ID via campo oculto pois o select disabled não envia no Form */}
                            {isMember && <input type="hidden" name="assigneeId" value={currentUser.id} />}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                        <div className="w-full sm:w-28 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-md overflow-hidden relative h-9 shrink-0">
                            <select name="priority" defaultValue="3" className="w-full h-full appearance-none bg-transparent text-[11px] font-mono font-semibold text-slate-600 outline-none cursor-pointer pl-2 pr-7" required>
                                <option value="1">P1 [CRITICO]</option>
                                <option value="2">P2 [ALTO]</option>
                                <option value="3">P3 [MEDIO]</option>
                                <option value="4">P4 [BAIXO]</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>

                        <div className="w-full sm:w-32 bg-slate-50 border border-slate-200 rounded-md px-2 h-9 focus-within:border-blue-400 hover:bg-slate-100 transition-colors shrink-0">
                            <input type="date" name="date" defaultValue={today} className="w-full h-full bg-transparent text-[11px] font-mono font-semibold text-slate-600 outline-none cursor-pointer [color-scheme:light]" required />
                        </div>

                        <div className="w-full sm:w-24 bg-slate-50 border border-slate-200 rounded-md px-2 h-9 focus-within:border-blue-400 hover:bg-slate-100 transition-colors shrink-0">
                            <input type="time" name="time" className="w-full h-full bg-transparent text-[11px] font-mono font-semibold text-slate-600 outline-none cursor-pointer text-center [color-scheme:light]" defaultValue="12:00" required />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full sm:w-auto h-9 px-6 bg-blue-600 text-white rounded-md text-xs font-mono font-bold hover:bg-blue-500 active:scale-[0.98] shadow-sm disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
                    >
                        {pending ? '...' : 'EXEC'}
                    </button>
                </div>

                {state?.error && <span className="absolute -bottom-6 left-2 text-red-600 text-xs font-mono">{state.error}</span>}
                {state?.success && <span className="absolute -bottom-6 left-2 text-emerald-600 text-xs font-mono"><svg className="inline mr-1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg>Inserted</span>}
            </form>
        </div>
    );
}
