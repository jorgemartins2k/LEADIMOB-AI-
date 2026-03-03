"use client";

import { useState } from "react";
import { Plus, Search, Filter, Building2, Rocket, Construction, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LaunchesPage() {
    const [activeTab, setActiveTab] = useState("todos");

    const stats = [
        { label: "Total", value: "0" },
        { label: "Em Lançamento", value: "0" },
        { label: "Em Construção", value: "0" },
        { label: "Prontos", value: "0" },
        { label: "Unidades Disp.", value: "0" },
    ];

    const tabs = [
        { id: "todos", label: "Todos" },
        { id: "lancamento", label: "Em Lançamento", icon: Rocket },
        { id: "construcao", label: "Em Construção", icon: Construction },
        { id: "prontos", label: "Prontos", icon: CheckCircle2 },
        { id: "esgotados", label: "Esgotados", icon: Lock },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="heading-xl text-foreground">Novos <span className="text-gradient-accent">Lançamentos</span></h1>
                    <p className="text-body font-medium leading-relaxed">Gerencie unidades e materiais de venda dos seus empreendimentos em destaque.</p>
                </div>
                <Button className="btn-primary h-16 px-10 font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all" asChild>
                    <Link href="/lancamentos/novo">
                        <Plus className="h-5 w-5" /> Novo Lançamento
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="card-premium p-8 flex flex-col gap-3">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">{stat.label}</span>
                        <div className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Tabs & Filter Design v2 */}
            <div className="flex items-center gap-4 bg-muted/20 p-2.5 rounded-[32px] overflow-x-auto no-scrollbar border border-border/50 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-3 px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap btn-interactive",
                            activeTab === tab.id
                                ? "bg-foreground text-background shadow-2xl shadow-black/20"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        {tab.icon && <tab.icon className="h-4 w-4" />}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Empty State Area */}
            <div className="flex flex-col items-center justify-center py-32 rounded-[56px] border-4 border-dashed border-muted/50 bg-muted/5 group hover:border-accent/30 transition-all duration-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-3xl bg-muted/30 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                        <Building2 className="h-12 w-12 text-muted-foreground opacity-30" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4">Nenhum lançamento ativo</h3>
                    <p className="text-muted-foreground font-bold max-w-sm mb-12 opacity-60 leading-relaxed">
                        Sua vitrine de lançamentos está vazia. Adicione novas oportunidades para a <span className="text-foreground">Raquel</span> prospectar investidores.
                    </p>
                    <Button className="btn-primary px-12 h-16 rounded-[24px] shadow-2xl hover:scale-105 active:scale-95 transition-all font-black uppercase text-[10px] tracking-widest bg-accent hover:bg-accent/90" asChild>
                        <Link href="/lancamentos/novo">
                            <Plus className="h-5 w-5 mr-3" /> Cadastrar Meu Primeiro Lançamento
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
