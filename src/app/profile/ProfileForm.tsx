"use client";

import { useState } from "react";
import { updateProfileAction } from "./actions";

export function ProfileForm({ user }: { user: any }) {
    const [name, setName] = useState(user?.name || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("currentPassword", currentPassword);
        formData.append("newPassword", newPassword);
        formData.append("confirmPassword", confirmPassword);

        const res = await updateProfileAction(formData);

        if (res.error) {
            setError(res.error);
        } else {
            setSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
                <div className="bg-red-50 text-red-600 text-[11px] font-mono px-3 py-2 border border-red-100 rounded-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-50 text-emerald-600 text-[11px] font-mono px-3 py-2 border border-emerald-100 rounded-sm">
                    Perfil atualizado com sucesso! (Se alterou o nome, faça login novamente para refletir no painel superior).
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Informações Públicas</h3>

                <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Nome de Exibição / Apelido</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-2 text-xs font-mono text-slate-700 outline-none focus:border-slate-800 focus:bg-white transition-colors"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">E-mail (Login) - Fixo</label>
                    <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full h-9 bg-slate-100 border border-slate-200 rounded px-2 text-xs font-mono text-slate-400 outline-none cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Segurança (Troca de Senha)</h3>
                <p className="text-[10px] text-slate-500">Deixe os campos em branco se não quiser alterar a senha.</p>

                <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Senha Atual</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-2 text-xs font-mono text-slate-700 outline-none focus:border-slate-800 focus:bg-white transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Nova Senha</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-2 text-xs font-mono text-slate-700 outline-none focus:border-slate-800 focus:bg-white transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-2 text-xs font-mono text-slate-700 outline-none focus:border-slate-800 focus:bg-white transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="h-9 px-6 bg-slate-900 text-white font-mono text-[10px] font-bold rounded-md hover:bg-slate-800 transition-colors uppercase tracking-widest disabled:opacity-50"
                >
                    {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
            </div>
        </form>
    );
}
