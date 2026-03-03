"use client";

import { Plus, Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EventosPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="heading-hero text-foreground">Eventos</h1>
                    <p className="text-body text-lg text-muted-foreground">Open houses, feirões e lançamentos.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-8 h-16 rounded-[24px] shadow-primary/20 shadow-xl transition-all hover:scale-105 active:scale-95 text-xs">
                    <Plus className="h-5 w-5 mr-3" /> Novo Evento
                </Button>
            </div>

            {/* Section Title */}
            <div className="flex items-center gap-3 pt-6 border-t border-border">
                <Calendar className="w-6 h-6 text-muted-foreground" />
                <h3 className="font-display font-black text-xl text-foreground uppercase tracking-tight">Próximos Eventos</h3>
            </div>

            {/* Empty State Area */}
            <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-muted/50 rounded-[48px] bg-card/30 group hover:border-primary/20 transition-all duration-500 shadow-soft">
                <div className="w-24 h-24 rounded-full bg-muted shadow-inner flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                    <Calendar className="h-10 w-10 text-foreground opacity-60" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">Nenhum evento agendado</h3>
                <p className="text-muted-foreground font-bold max-w-sm text-center text-sm mb-12 opacity-60">
                    Crie seu primeiro open house ou feirão para atrair novos leads qualificados.
                </p>
                <Button className="bg-foreground text-background font-black uppercase tracking-widest px-10 h-16 rounded-[24px] shadow-xl transition-all hover:scale-105 active:scale-95 text-xs">
                    <Plus className="h-5 w-5 mr-3" /> Criar Primeiro Evento
                </Button>
            </div>
        </div>
    );
}
