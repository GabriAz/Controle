"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Credenciais inválidas. Tente novamente.");
            setLoading(false);
        } else {
            router.push("/");
            router.refresh(); // Forçar hidratação Server-side na home
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 antialiased">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-10 text-center">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 border-2 border-slate-900 px-3 py-1 mb-2">GA</h1>
                    <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-slate-400 uppercase">Gabriel Azevedo</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-[11px] font-mono px-3 py-2 border border-red-100 rounded-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider ml-1">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@gabrielazevedo.com.br"
                            required
                            className="w-full h-11 bg-slate-50 border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-md px-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider ml-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full h-11 bg-slate-50 border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-md px-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 mt-4 bg-slate-900 text-white font-mono text-[11px] font-bold tracking-widest uppercase rounded-md hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? "Acessando..." : "Entrar_"}
                    </button>
                </form>

                <p className="mt-8 text-center text-[9px] font-mono text-slate-300">
                    PROTEGIDO • ACESSO RESTRITO
                </p>
            </div>
        </div>
    );
}
