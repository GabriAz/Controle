"use client";

import { useState } from "react";
import { updateUser, deleteUser } from "./actions";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    canSeeOthersTasks: boolean;
};

export function UserTableRow({ user }: { user: User }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [keepTasks, setKeepTasks] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await updateUser(user.id, formData);
        setIsLoading(false);
        if (res?.error) {
            alert(res.error);
        } else {
            setIsEditing(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Tem certeza que deseja excluir o acesso deste usuário permanentemente?")) return;
        setIsLoading(true);
        const res = await deleteUser(user.id, keepTasks);
        setIsLoading(false);
        if (res?.error) {
            alert(res.error);
        } else {
            setIsDeleting(false);
        }
    }

    if (isEditing) {
        return (
            <tr className="border-b border-slate-100 hover:bg-white transition-colors">
                <td colSpan={5} className="p-3">
                    <form onSubmit={handleEdit} className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Nome</label>
                                <input type="text" name="name" defaultValue={user.name} required className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-mono text-slate-700 outline-none focus:border-slate-800" />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">E-mail</label>
                                <input type="email" name="email" defaultValue={user.email} required className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-mono text-slate-700 outline-none focus:border-slate-800" />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Nova Senha (opcional)</label>
                                <input type="text" name="password" placeholder="Em branco para não alterar" className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-mono text-slate-700 outline-none focus:border-slate-800" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Role</label>
                                    <select name="role" defaultValue={user.role} className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-[11px] font-mono font-bold text-slate-700 outline-none focus:border-slate-800">
                                        <option value="MEMBER">MEMBER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Status</label>
                                    <select name="active" defaultValue={user.active ? "true" : "false"} className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-[11px] font-mono font-bold text-slate-700 outline-none focus:border-slate-800">
                                        <option value="true">ATIVO</option>
                                        <option value="false">INATIVO</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="canSeeOthersTasks" defaultChecked={user.canSeeOthersTasks} className="w-4 h-4 accent-slate-900 rounded" />
                                <label className="text-[10px] font-mono font-bold text-slate-600 uppercase cursor-pointer">Inspecionar outros (ver tudo)</label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-mono font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded">Cancelar</button>
                            <button type="submit" disabled={isLoading} className="px-3 py-1.5 text-xs font-mono font-bold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-2">
                                {isLoading ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </form>
                </td>
            </tr>
        );
    }

    if (isDeleting) {
        return (
            <tr className="border-b border-red-50 hover:bg-red-50 transition-colors">
                <td colSpan={5} className="p-4">
                    <div className="bg-red-50 p-4 rounded border border-red-200 flex flex-col gap-3">
                        <h4 className="text-sm font-bold text-red-900">Excluindo o usuário {user.name} ({user.email})</h4>
                        <label className="flex items-center gap-2 text-xs font-mono text-red-800 mt-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!keepTasks}
                                onChange={(e) => setKeepTasks(!e.target.checked)}
                                className="w-4 h-4 accent-red-600 rounded"
                            />
                            Apagar também todas as tarefas atribuídas a este usuário.
                        </label>
                        <p className="text-[10px] text-red-600 mt-1 mb-2">(Se desmarcado, as tarefas perderão o dono mas continuarão no sistema)</p>

                        <div className="flex gap-2">
                            <button onClick={() => setIsDeleting(false)} className="px-3 py-1.5 text-xs font-mono font-bold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50">Cancelar</button>
                            <button onClick={handleDelete} disabled={isLoading} className="px-3 py-1.5 text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50">
                                {isLoading ? "Excluindo..." : "Confirmar Exclusão"}
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className="border-b border-slate-100 hover:bg-white transition-colors group">
            <td className="p-3 text-[11px] font-mono font-bold text-slate-800">{user.name}</td>
            <td className="p-3 text-[11px] font-mono text-slate-500">{user.email}</td>
            <td className="p-3 text-center">
                <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase ${user.canSeeOthersTasks ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                    {user.canSeeOthersTasks ? 'SIM' : 'NÃO'}
                </span>
            </td>
            <td className="p-3">
                <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase ${user.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {user.role}
                </span>
            </td>
            <td className="p-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(true)} className="text-[10px] font-mono font-bold uppercase text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">Edit</button>
                    <button onClick={() => setIsDeleting(true)} className="text-[10px] font-mono font-bold uppercase text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded">Del</button>
                </div>
            </td>
        </tr>
    );
}
