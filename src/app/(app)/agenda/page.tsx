"use client";

import { useState } from "react";
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, Bell, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AgendaPage() {
    const stats = [
        { label: "Hoje", value: "0" },
        { label: "Esta Semana", value: "0" },
        { label: "Confirmadas", value: "0", color: "text-success" },
        { label: "Pendentes", value: "0", color: "text-warm" },
    ];

    const days = [
        { day: 1, active: false }, { day: 2, active: false }, { day: 3, active: true },
        { day: 4, active: false }, { day: 5, active: false }, { day: 6, active: false },
        { day: 7, active: false }, { day: 8, active: false }, { day: 9, active: false },
        { day: 10, active: false }, { day: 11, active: false }, { day: 12, active: false },
        { day: 13, active: false }, { day: 14, active: false }, { day: 15, active: false },
        { day: 16, active: false }, { day: 17, active: false }, { day: 18, active: false },
        { day: 19, active: false }, { day: 20, active: false }, { day: 21, active: false },
        { day: 22, active: false }, { day: 23, active: false }, { day: 24, active: false },
        { day: 25, active: false }, { day: 26, active: false }, { day: 27, active: false },
        { day: 28, active: false }
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="heading-xl text-foreground">Agenda de <span className="text-gradient-accent">Visitas</span></h1>
                    <p className="text-body font-medium leading-relaxed">Gerencie seus compromissos e as visitas agendadas automaticamente pela <span className="text-foreground font-black">Raquel</span>.</p>
                </div>
                <Button className="btn-primary h-16 px-10 font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
                    <Plus className="h-5 w-5" /> Agendar Visita
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="card-premium p-8 flex flex-col gap-3">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">{stat.label}</span>
                        <div className={cn("text-4xl font-black tracking-tighter", stat.color || "text-foreground")}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 card-premium p-10 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-all" />

                    <div className="flex items-center justify-between mb-12">
                        <div className="flex flex-col gap-1">
                            <h3 className="font-display font-black text-3xl text-foreground uppercase tracking-tight">Março <span className="text-primary">2026</span></h3>
                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <div className="w-2 h-2 bg-primary rounded-full" /> 3 Visitas confirmadas
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted/20 hover:bg-muted btn-interactive">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" className="h-12 rounded-2xl bg-muted/40 font-black text-[10px] uppercase tracking-widest px-8 btn-interactive">
                                Hoje
                            </Button>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted/20 hover:bg-muted btn-interactive">
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-6 mb-8 text-center">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                            <div key={d} className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-6">
                        {days.map((d, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "aspect-square rounded-[24px] flex items-center justify-center text-sm font-black transition-all cursor-pointer relative group/day",
                                    d.active
                                        ? "bg-primary text-white shadow-xl shadow-primary/30 scale-110 z-10"
                                        : "bg-muted/10 border border-transparent hover:bg-muted/30 hover:border-border/50 text-foreground/60"
                                )}
                            >
                                {d.active && <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-primary" />}
                                {d.day}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Visits */}
                <div className="card-premium p-10 bg-muted/20 shadow-inner">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-card rounded-2xl border border-border/50 shadow-sm">
                            <CalendarIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-display font-black text-xl text-foreground uppercase tracking-tight">Compromissos</h3>
                    </div>

                    <div className="flex flex-col items-center justify-center py-24 bg-card/50 rounded-[48px] border-4 border-dashed border-muted/50 group hover:border-accent/30 transition-all duration-700 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                                <Clock className="h-10 w-10 text-muted-foreground opacity-30" />
                            </div>
                            <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] mb-4">Nenhum evento próximo</p>
                            <p className="text-muted-foreground/60 font-bold text-xs max-w-[200px] mb-10 leading-relaxed">Sua agenda está livre! Que tal prospectar novos leads?</p>
                            <Button variant="link" className="text-primary font-black uppercase tracking-widest text-[9px] hover:no-underline group/btn flex items-center gap-2">
                                Gerar Agenda com IA <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
