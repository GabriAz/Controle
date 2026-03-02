import { prisma } from "@/lib/prisma";
import { createUser } from "./actions";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { UserTableRow } from "./UserTableRow";

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams?: { error?: string, success?: string }
}) {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, active: true, canSeeOthersTasks: true, createdAt: true },
    });

    async function clientAction(formData: FormData) {
        "use server";
        const res = await createUser(formData);

        if (res?.error) {
            console.error(res.error);
        }
        revalidatePath("/admin/users");
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 mt-16 md:mt-20">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Gestão de Integrantes</h1>
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-sm border border-slate-200">
                        ← Voltar ao Radar
                    </Link>
                    <span className="bg-slate-900 text-white text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-1 rounded-sm shadow-sm">
                        Admin Area
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Col */}
                <div className="md:col-span-1">
                    <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-4">Novo Acesso</h2>
                    <form action={clientAction} className="flex flex-col gap-4 bg-slate-50 p-4 border border-slate-100 rounded-md">
                        <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Nome / Apelido</label>
                            <input type="text" name="name" required className="w-full h-9 bg-white border border-slate-200 rounded px-2 text-xs font-mono text-slate-700 outline-none focus:border-slate-800" placeholder="Ex: João" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">E-mail (Login)</label>
                            <input type="email" name="email" required className="w-full h-9 bg-white border border-slate-200 rounded px-2 text-xs font-mono text-slate-700 outline-none focus:border-slate-800" placeholder="joao@gabrielazevedo.com.br" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Senha Temporária</label>
                            <input type="text" name="password" required className="w-full h-9 bg-white border border-slate-200 rounded px-2 text-xs font-mono text-slate-700 outline-none focus:border-slate-800" placeholder="senha123" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Nível de Acesso</label>
                            <select name="role" className="w-full h-9 bg-white border border-slate-200 rounded px-2 text-[11px] font-mono font-bold text-slate-700 outline-none focus:border-slate-800">
                                <option value="MEMBER">MEMBER (Comum)</option>
                                <option value="ADMIN">ADMIN (Chefe)</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 py-1">
                            <input type="checkbox" name="canSeeOthersTasks" id="canSeeOthersTasks" defaultChecked className="w-4 h-4 accent-slate-900 rounded" />
                            <label htmlFor="canSeeOthersTasks" className="text-[10px] font-mono font-bold text-slate-600 uppercase cursor-pointer">Ver atividades de outros</label>
                        </div>

                        <button type="submit" className="h-9 w-full bg-slate-900 text-white font-mono text-[10px] font-bold rounded hover:bg-slate-800 transition-colors uppercase tracking-widest mt-2 disabled:opacity-50">
                            Gerar Acesso
                        </button>
                    </form>
                </div>

                {/* Table Col */}
                <div className="md:col-span-2">
                    <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-4">Contas Ativas ({users.length})</h2>
                    <div className="bg-slate-50 border border-slate-100 rounded-md overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-200">
                                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase">Nome</th>
                                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase">E-mail</th>
                                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase text-center">Inspecionar?</th>
                                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase">Role</th>
                                    <th className="p-3 text-[10px] font-mono text-slate-500 uppercase text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u: any) => (
                                    <UserTableRow key={u.id} user={u} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
