"use client";

import { Bell, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NotificacoesPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="heading-xl text-foreground">Sinalizações do <span className="text-gradient-accent">Sistema</span></h1>
                    <p className="text-body font-medium leading-relaxed">Fique por dentro de tudo o que a <span className="text-foreground font-black">Raquel</span> e sua equipe estão realizando.</p>
                </div>
                <div className="px-5 py-2 bg-muted/20 text-muted-foreground rounded-full text-[10px] font-black uppercase tracking-widest border border-border/50">
                    Nenhuma Alerta Pendente
                </div>
            </div>

            {/* Filters v2 */}
            <div className="card-premium p-6 flex flex-col md:flex-row items-center gap-6 bg-muted/10">
                <div className="flex items-center gap-4 px-4">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Filtrar por:</span>
                </div>

                <div className="flex flex-wrap gap-4 flex-1">
                    <Select defaultValue="todos">
                        <SelectTrigger className="w-[200px] h-14 bg-card border border-border/50 rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 shadow-sm hover:shadow-md transition-all">
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[24px] border-border bg-card/95 backdrop-blur-xl">
                            <SelectItem value="todos">Todos os Eventos</SelectItem>
                            <SelectItem value="leads">Interações de Leads</SelectItem>
                            <SelectItem value="sistema">Alertas de Sistema</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select defaultValue="todas">
                        <SelectTrigger className="w-[200px] h-14 bg-card border border-border/50 rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 shadow-sm hover:shadow-md transition-all">
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[24px] border-border bg-card/95 backdrop-blur-xl">
                            <SelectItem value="todas">Todo o Período</SelectItem>
                            <SelectItem value="hoje">Hoje</SelectItem>
                            <SelectItem value="semana">Últimos 7 Dias</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="px-8 border-l border-border/50 hidden md:block">
                    <div className="flex flex-col text-right">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total</span>
                        <span className="text-xl font-black text-foreground">0</span>
                    </div>
                </div>
            </div>

            {/* Empty State Area */}
            <div className="flex flex-col items-center justify-center py-40 rounded-[56px] border-4 border-dashed border-muted/50 bg-muted/5 group hover:border-accent/20 transition-all duration-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-3xl bg-muted/30 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                        <Bell className="h-12 w-12 text-muted-foreground opacity-30" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4 text-center">Tudo em ordem por aqui</h3>
                    <p className="text-muted-foreground font-bold max-w-sm text-center text-sm mb-12 opacity-60 leading-relaxed">
                        Você leu todas as notificações recentes. Novas atividades da <span className="text-foreground">Raquel</span> aparecerão aqui em tempo real.
                    </p>
                </div>
            </div>
        </div>
    );
}
