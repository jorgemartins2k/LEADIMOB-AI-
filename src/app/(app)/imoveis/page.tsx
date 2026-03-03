"use client";

import { Plus, Search, Filter, Home, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function PropertiesPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="heading-xl text-foreground">Gestão de <span className="text-gradient-accent">Portfólio</span></h1>
                    <p className="text-body font-normal leading-relaxed">Organize e disponibilize seus imóveis para a <span className="text-foreground font-semibold">Raquel</span> oferecer via WhatsApp.</p>
                </div>
                <Button className="btn-primary h-16 px-10 font-semibold uppercase text-[10px] tracking-wider gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
                    <Plus className="h-5 w-5" /> Adicionar Imóvel
                </Button>
            </div>

            {/* Stats/Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { l: "Total Ativos", v: "12", c: "text-primary" },
                    { l: "Destaques IA", v: "4", c: "text-accent" },
                    { l: "Em Negociação", v: "3", c: "text-purple" },
                    { l: "Disponíveis", v: "5", c: "text-success" },
                ].map((s, i) => (
                    <div key={i} className="card-premium p-6 flex flex-col gap-3">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{s.l}</span>
                        <span className={cn("text-3xl font-bold tracking-tighter", s.c)}>{s.v}</span>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="card-premium p-4 flex-1 flex items-center gap-4 bg-muted/20">
                    <Search className="w-5 h-5 text-muted-foreground ml-2" />
                    <Input
                        placeholder="Buscar por código, rua ou condomínio..."
                        className="bg-transparent border-none h-10 font-bold focus-visible:ring-0 placeholder:opacity-50"
                    />
                </div>
                <Button variant="outline" className="h-[74px] px-8 rounded-[24px] border-border/50 gap-3 btn-interactive">
                    <Filter className="w-4 h-4" /> Filtros Avançados
                </Button>
            </div>

            {/* Empty State Area */}
            <div className="flex flex-col items-center justify-center py-32 rounded-[56px] border-4 border-dashed border-muted/50 bg-muted/5 group hover:border-accent/20 transition-all duration-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-3xl bg-muted/30 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                        <Home className="h-12 w-12 text-muted-foreground opacity-40" />
                    </div>
                    <h3 className="text-3xl font-bold text-foreground uppercase tracking-tight mb-4 text-center">Nenhum imóvel cadastrado</h3>
                    <p className="text-muted-foreground font-normal max-w-sm text-center text-sm mb-12 opacity-60 leading-relaxed">
                        Sua vitrine está vazia. Adicione suas primeiras propriedades para que a <span className="text-foreground font-semibold">Raquel</span> inicie as abordagens automáticas.
                    </p>
                    <Button className="btn-primary px-12 h-16 rounded-[24px] shadow-2xl hover:scale-105 active:scale-95 transition-all font-semibold uppercase text-[10px] tracking-wider">
                        <Plus className="h-5 w-5 mr-3" /> Cadastrar Meu Primeiro Imóvel
                    </Button>
                </div>
            </div>
        </div>
    );
}
