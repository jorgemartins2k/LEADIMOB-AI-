"use client";

import { useState } from "react";
import { Plus, Search, Filter, User, Bell, MessageSquare, Flame, Snowflake, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function LeadsPage() {
    const [activeTab, setActiveTab] = useState("todos");

    const tabs = [
        { id: "todos", label: "Todos", count: 0 },
        { id: "quentes", label: "Quentes", count: 0, icon: Flame, color: "text-hot" },
        { id: "mornos", label: "Mornos", count: 0, icon: Thermometer, color: "text-warm" },
        { id: "frios", label: "Frios", count: 0, icon: Snowflake, color: "text-blue-400" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="heading-hero text-foreground">Leads</h1>
                    <p className="text-body text-lg flex items-center gap-2">
                        Atendimento em tempo real por IA
                        <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                    </p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-8 h-16 rounded-[24px] shadow-primary/20 shadow-xl transition-all hover:scale-105 active:scale-95 text-xs">
                    <Plus className="h-5 w-5 mr-3" /> Adicionar Lead
                </Button>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-3 rounded-[32px] shadow-soft">
                <div className="flex items-center gap-2 p-1 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-muted text-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            {tab.icon && <tab.icon className={cn("h-4 w-4", tab.color)} />}
                            {tab.label}
                            <Badge variant="secondary" className="bg-white/10 text-[9px] font-bold px-2 py-0">
                                {tab.count}
                            </Badge>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 px-4 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou telefone..."
                            className="pl-12 h-14 bg-muted/30 border-none rounded-2xl font-bold text-xs tracking-tight placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all">
                        <Filter className="h-4 w-4 text-foreground" />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-muted/50 rounded-[48px] bg-muted/5 group hover:border-primary/20 transition-all duration-500">
                <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                    <User className="h-12 w-12 text-primary opacity-30" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">Nenhum lead encontrado</h3>
                <p className="text-muted-foreground font-bold max-w-sm text-center text-sm mb-12 opacity-60">
                    Adicione seus primeiros leads para que a Raquel comece a trabalhar imediatamente.
                </p>
                <Button className="bg-foreground text-background font-black uppercase tracking-widest px-10 h-16 rounded-[24px] shadow-soft transition-all hover:scale-105 active:scale-95 text-xs">
                    <Plus className="h-5 w-5 mr-3" /> Adicionar Primeiro Lead
                </Button>
            </div>
        </div>
    );
}
