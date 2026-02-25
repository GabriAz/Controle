"use client"
import { useState } from 'react';

export function InfoModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-[10px] sm:text-xs font-mono font-bold uppercase text-slate-500 hover:text-slate-800 transition-colors bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-sm shrink-0"
                title="Manual de Instruções"
                aria-label="Abrir manual"
            >
                Manual
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manual de Inteligência</h2>
                                <p className="text-xs font-mono tracking-widest text-slate-400 mt-1 uppercase">Sistema Controle (V1.0)</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-8 text-sm text-slate-600">

                            {/* Conceito Base */}
                            <section>
                                <h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-500"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                                    1. Alta Densidade & Minimalismo
                                </h3>
                                <p className="leading-relaxed">
                                    Diferente de sistemas Kanban comuns, este software usa o conceito de <strong>Painel HUD de Alta Densidade</strong> projetado na estética <i>Clean White</i>. O objetivo é remover distrações, bordas inúteis e excesso de cores para condensar o máximo de tarefas (Threads) possíveis em uma visão de funil de priorização.
                                </p>
                            </section>

                            <section>
                                <h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange-500"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                    2. Cálculo de Urgência (U:X.XX)
                                </h3>
                                <p className="leading-relaxed mb-3">
                                    No Radar, a cor dos itens não é escolhida pelo usuário. Ela é montada por um <strong>Algoritmo de Deterioração Temporal</strong> que mescla o multiplicador da sua Prioridade [P1 Crítico à P4 Baixo] com a contagem de horas até o *Deadline*.
                                </p>
                                <ul className="list-disc pl-5 space-y-1 font-mono text-xs font-semibold text-slate-500">
                                    <li><span className="text-red-500">Vermelho:</span> Urgente (Prioridade e Tempo curtos)</li>
                                    <li><span className="text-orange-500">Laranja:</span> Atenção Moderada (Subindo)</li>
                                    <li><span className="text-blue-500">Azul:</span> Saudável / Rotina de Produção</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
                                    3. Glossário de Ferramentas (Siglas Rápidas)
                                </h3>
                                <p className="leading-relaxed mb-4">
                                    A UI foi pensada para telas e toques mobile rápidos. Para não aglomerar textos nos Cartões, adotamos o padrão aeronáutico <code>Acrônimo de 3 Letras</code>. Entenda os botões:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                                        <div className="font-mono font-bold text-xs text-slate-700 mb-1">EDT (Edit)</div>
                                        <p className="text-[11px] leading-tight text-slate-500">Abre o formulário da linha e permite trocar Nome, Responsável (Assignee), Data e Prioridade.</p>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                                        <div className="font-mono font-bold text-xs text-orange-600 mb-1">SNZ (Snooze)</div>
                                        <p className="text-[11px] leading-tight text-slate-500">Só surge na Emergência (-30min). "Soneca" joga o deadline pra frente em +2 horas dando fôlego.</p>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                                        <div className="font-mono font-bold text-xs text-emerald-600 mb-1">EXC / RUN</div>
                                        <p className="text-[11px] leading-tight text-slate-500">Execute! Inicia fisicamente a tarefa no radar mudando a flag visual para <i>Rodando</i>.</p>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                                        <div className="font-mono font-bold text-xs text-slate-800 mb-1">END</div>
                                        <p className="text-[11px] leading-tight text-slate-500">Encerra a tarefa do fluxo principal e declara-a como Finalizada.</p>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                                        <div className="font-mono font-bold text-xs text-red-500 mb-1">DEL (Delete)</div>
                                        <p className="text-[11px] leading-tight text-slate-500">Destruição permanente! Apagar a raiz apagará todas as subtarefas em cascata juntas.</p>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                                        <div className="font-mono font-bold text-xs text-slate-700 mb-1">+ADD</div>
                                        <p className="text-[11px] leading-tight text-slate-500">Inicia uma Thread (Subtarefa) vinculada em árvore a diretriz principal. Aceita Enter.</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-indigo-400"><path d="M5 9l4 4-4 4" /><path d="M13 17h6" /></svg>
                                    4. Teclas Quentes & Flexibilidade
                                </h3>
                                <p className="leading-relaxed mb-6">
                                    O campo de Título suporta múltiplas linhas. Para criar espaços contínuos, no teclado aperte <code>Shift + Enter</code>. Você pode reordenar qual processo acontece primeiro no dia segurando nas "marcas texturais da borda" esquerda de cada linha e <code>Arrastando as linhas de lugar</code>.
                                </p>
                            </section>

                            <div className="h-px bg-slate-200 my-8"></div>

                            {/* Novos Módulos */}
                            <section>
                                <h3 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cyan-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                                    5. Ecossistema Extendido
                                </h3>
                                <div className="space-y-4 mt-3">
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="font-bold text-sm text-slate-800 mb-1">Painel Visual (Board Kanban)</div>
                                        <p className="text-xs leading-relaxed text-slate-500">
                                            Uma visão expandida do escopo temporal. O Painel agrupa as tarefas ativas em 4 colunas cronológicas: <strong>Para Hoje</strong>, <strong>Esta Semana</strong>, <strong>Este Mês</strong> e <strong>Futuro</strong>. Excelente para planejamento em larga escala, ignorando a miopia da urgência imediata.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="font-bold text-sm text-slate-800 mb-1">The END (Arquivo Morto)</div>
                                        <p className="text-xs leading-relaxed text-slate-500">
                                            O cemitério de sucessos. Quando um Card recebe o comando <code>END</code> no Radar, ele sai do campo de visão ativo e é congelado criptograficamente nesta aba. Nenhuma informação é apagada, apenas armazenada fora do seu espectro de ansiedade.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="font-bold text-sm text-slate-800 mb-1">Relatórios & Histórico</div>
                                        <p className="text-xs leading-relaxed text-slate-500">
                                            Módulo Analítico. Permite filtrar todo o histórico de tarefas concluídas por <strong>Usuário</strong> e <strong>Período de Tempo</strong>. Gera listagens exatas de produção provando o volume de trabalho entregue sem achismos.
                                        </p>
                                    </div>
                                </div>
                            </section>

                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all font-mono text-xs w-full sm:w-auto"
                            >
                                FECHAR MANUAL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
