"use client";

import { Bell, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NotificacoesPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="heading-hero text-foreground">Notificações</h1>
                <p className="text-body text-lg text-muted-foreground">Todas as notificações lidas</p>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border p-6 rounded-[32px] shadow-soft flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">Filtros:</span>
                </div>
                <Select defaultValue="todos">
                    <SelectTrigger className="w-[200px] h-12 bg-muted/30 border-none rounded-2xl font-bold text-[10px] uppercase tracking-widest">
                        <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos os tipos</SelectItem>
                        <SelectItem value="leads">Leads</SelectItem>
                        <SelectItem value="sistema">Sistema</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="todas">
                    <SelectTrigger className="w-[200px] h-12 bg-muted/30 border-none rounded-2xl font-bold text-[10px] uppercase tracking-widest">
                        <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="hoje">Hoje</SelectItem>
                        <SelectItem value="semana">Esta Semana</SelectItem>
                    </SelectContent>
                </Select>
                <div className="ml-auto text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                    0 notificações
                </div>
            </div>

            {/* Empty State Area */}
            <div className="flex flex-col items-center justify-center py-40 border-4 border-dashed border-muted/50 rounded-[48px] bg-card/30 group hover:border-primary/20 transition-all duration-500 shadow-soft">
                <div className="w-24 h-24 rounded-full bg-muted shadow-inner flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                    <Bell className="h-10 w-10 text-foreground opacity-60" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">Nenhuma notificação encontrada</h3>
                <p className="text-muted-foreground font-bold max-w-sm text-center text-sm opacity-60">
                    Você não tem notificações no momento.
                </p>
            </div>
        </div>
    );
}
