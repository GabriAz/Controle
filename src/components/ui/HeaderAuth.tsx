"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export function HeaderAuth() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!session) return null;

    return (
        <header className="fixed top-0 left-0 w-full h-12 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 z-50">
            <div className="flex items-center gap-4">
                <Link href="/" className="text-[14px] font-black tracking-tight text-slate-800 border-2 border-slate-900 px-1.5 leading-none py-0.5 hover:bg-slate-900 hover:text-white transition-colors">
                    GA
                </Link>
                {/* @ts-expect-error - session.user.role may not be typed globally */}
                {session.user?.role === "ADMIN" && (
                    <Link href="/admin/users" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                        Administração
                    </Link>
                )}
            </div>

            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-md transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
                >
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono font-bold text-slate-700">{session.user?.name}</span>
                        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest leading-none bg-slate-100 px-1 rounded-sm mt-0.5">
                            {/* @ts-expect-error - session.user.role missing type */}
                            {session.user?.role}
                        </span>
                    </div>
                    <div className="w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-500 rounded-sm border border-slate-200">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-2 border-b border-slate-100 mb-1">
                            <p className="text-[10px] font-mono font-bold text-slate-800 truncate">{session.user?.name}</p>
                            <p className="text-[9px] font-mono text-slate-400 truncate">{session.user?.email}</p>
                        </div>

                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-[11px] font-mono font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                            Meu Perfil
                        </Link>

                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-[11px] font-mono font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            Radar
                        </Link>

                        <div className="h-px bg-slate-100 my-1"></div>

                        <button
                            onClick={() => { setIsOpen(false); signOut({ callbackUrl: "/login" }); }}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-[11px] font-mono font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                            Sair do Sistema
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
