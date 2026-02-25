import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions) as any;

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 mt-16 md:mt-20">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Meu Perfil</h1>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mt-1">
                        Gestão de Credenciais Pessoais
                    </p>
                </div>
                <Link href="/" className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-sm border border-slate-200">
                    ← Voltar ao Radar
                </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
                <ProfileForm user={session.user} />
            </div>
        </div>
    );
}
