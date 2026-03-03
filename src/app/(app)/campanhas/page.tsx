"use client";

import { useState } from "react";
import { Plus, Megaphone, CheckCircle2, MousePointer2, UserPlus, BarChart3, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CampanhasPage() {
    const stats = [
        { label: "Campanhas Ativas", value: "0", color: "text-primary" },
        { label: "Total de Cliques", value: "0", color: "text-accent" },
        { label: "Leads Gerados", value: "0", color: "text-success" },
        { label: "Conversões", value: "0", color: "text-hot" },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="heading-hero text-foreground">Campanhas</h1>
                    <p className="text-body text-lg text-muted-foreground">Links rastreáveis para suas redes sociais.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-8 h-16 rounded-[24px] shadow-primary/20 shadow-xl transition-all hover:scale-105 active:scale-95 text-xs">
                    <Plus className="h-5 w-5 mr-3" /> Nova Campanha
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-card border border-border p-8 rounded-[32px] shadow-soft">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-4">{stat.label}</span>
                        <div className={cn("text-4xl font-black tracking-tighter", stat.color)}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* How it works */}
            <div className="bg-muted/10 border border-border rounded-[40px] p-10 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Info className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-black text-xl text-foreground uppercase tracking-tight">Como funciona</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        "Crie uma campanha vinculada a um imóvel ou lançamento",
                        "Copie o link rastreável gerado automaticamente",
                        "Cole nos seus posts, stories, bio ou mensagens",
                        "Acompanhe cliques e leads gerados em tempo real"
                    ].map((step, i) => (
                        <div key={i} className="flex gap-4">
                            <span className="text-primary font-black text-2xl opacity-40">{i + 1}.</span>
                            <p className="text-sm font-bold text-muted-foreground leading-relaxed">{step}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Campaigns Title */}
            <div className="flex items-center gap-3 pt-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h3 className="font-display font-black text-xl text-foreground uppercase tracking-tight">Campanhas Ativas</h3>
            </div>

            {/* Empty State Area */}
            <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-muted/50 rounded-[48px] bg-card/30 group hover:border-primary/20 transition-all duration-500 shadow-soft">
                <div className="w-24 h-24 rounded-full bg-muted shadow-inner flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                    <Megaphone className="h-10 w-10 text-foreground opacity-60" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">Nenhuma campanha ativa</h3>
                <p className="text-muted-foreground font-bold max-w-sm text-center text-sm mb-12 opacity-60">
                    Crie sua primeira campanha rastreável para monitorar o desempenho das suas divulgações.
                </p>
                <Button className="bg-foreground text-background font-black uppercase tracking-widest px-10 h-16 rounded-[24px] shadow-xl transition-all hover:scale-105 active:scale-95 text-xs">
                    <Plus className="h-5 w-5 mr-3" /> Criar Primeira Campanha
                </Button>
            </div>
        </div>
    );
}
