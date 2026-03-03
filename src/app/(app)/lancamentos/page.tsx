"use client";

import { useState } from "react";
import { Plus, Search, Filter, Building2, Rocket, Construction, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="heading-hero text-foreground">Lançamentos</h1>
                    <p className="text-body text-lg text-muted-foreground">Adicione e gerencie seus empreendimentos em destaque.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-8 h-16 rounded-[24px] shadow-primary/20 shadow-xl transition-all hover:scale-105 active:scale-95 text-xs">
                    <Plus className="h-5 w-5 mr-3" /> Novo Lançamento
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-card border border-border p-8 rounded-[32px] shadow-soft">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-4">{stat.label}</span>
                        <div className="text-4xl font-black text-foreground">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Tabs & Filter */}
            <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-[28px] overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-foreground text-background shadow-md"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        {tab.icon && <tab.icon className="h-4 w-4" />}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Empty State Area */}
            <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-muted/50 rounded-[48px] bg-card/30 group hover:border-primary/20 transition-all duration-500 shadow-soft">
                <div className="w-24 h-24 rounded-full bg-muted shadow-inner flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                    <Building2 className="h-10 w-10 text-foreground opacity-60" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">Nenhum lançamento cadastrado</h3>
                <p className="text-muted-foreground font-bold max-w-sm text-center text-sm mb-12 opacity-60">
                    Adicione seus primeiros empreendimentos em lançamento para que a Raquel possa ofertar aos seus leads.
                </p>
                <Button className="bg-foreground text-background font-black uppercase tracking-widest px-10 h-16 rounded-[24px] shadow-xl transition-all hover:scale-105 active:scale-95 text-xs">
                    <Plus className="h-5 w-5 mr-3" /> Cadastrar Primeiro Lançamento
                </Button>
            </div>
        </div>
    );
}
