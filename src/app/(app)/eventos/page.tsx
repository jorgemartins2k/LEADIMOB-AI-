"use client";

import { Plus, Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EventosPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="heading-xl text-foreground">Eventos de <span className="text-gradient-accent">Conversão</span></h1>
                    <p className="text-body font-medium leading-relaxed">Organize feirões e lançamentos com captação automática pela <span className="text-foreground font-black">Raquel</span>.</p>
                </div>
                <Button className="btn-primary h-16 px-10 font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
                    <Plus className="h-5 w-5" /> Novo Evento
                </Button>
            </div>

            {/* Section Title */}
            <div className="flex items-center gap-4 pt-10 border-t border-border/50">
                <div className="p-3 bg-muted/20 rounded-2xl">
                    <Calendar className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-display font-black text-2xl text-foreground uppercase tracking-tight">Próximas Iniciativas</h3>
            </div>

            {/* Empty State Area */}
            <div className="flex flex-col items-center justify-center py-32 rounded-[56px] border-4 border-dashed border-muted/50 bg-muted/5 group hover:border-primary/30 transition-all duration-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-3xl bg-muted/30 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                        <Calendar className="h-12 w-12 text-muted-foreground opacity-30" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4 text-center">Nenhum evento detectado</h3>
                    <p className="text-muted-foreground font-bold max-w-sm text-center text-sm mb-12 opacity-60 leading-relaxed">
                        Seu calendário de eventos está vazio. Crie um <span className="text-foreground">Lançamento</span> ou <span className="text-foreground">Open House</span> para impulsionar suas vendas.
                    </p>
                    <Button className="btn-primary px-12 h-16 rounded-[24px] shadow-2xl hover:scale-105 active:scale-95 transition-all font-black uppercase text-[10px] tracking-widest bg-foreground text-background">
                        <Plus className="h-5 w-5 mr-3" /> Criar Primeiro Evento
                    </Button>
                </div>
            </div>
        </div>
    );
}
