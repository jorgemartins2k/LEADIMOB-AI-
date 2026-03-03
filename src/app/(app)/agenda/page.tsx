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
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="heading-hero text-foreground">Calendário</h1>
                    <p className="text-body text-lg text-muted-foreground">Gerencie suas visitas e compromissos.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-8 h-16 rounded-[24px] shadow-primary/20 shadow-xl transition-all hover:scale-105 active:scale-95 text-xs">
                    <Plus className="h-5 w-5 mr-3" /> Agendar Visita
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-card border border-border p-8 rounded-[32px] shadow-soft">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-4">{stat.label}</span>
                        <div className={cn("text-4xl font-black text-foreground", stat.color)}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid gap-12 lg:grid-cols-3">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 bg-card border border-border rounded-[48px] p-10 shadow-soft">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="font-display font-black text-2xl text-foreground uppercase tracking-tight">Março 2026</h3>
                        <div className="flex gap-4">
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted/30">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" className="h-12 rounded-2xl bg-muted/30 font-black text-[10px] uppercase tracking-widest px-6">
                                Hoje
                            </Button>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted/30">
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-4 mb-6 text-center">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                            <div key={d} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-4">
                        {days.map((d, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "aspect-square rounded-[24px] flex items-center justify-center text-sm font-bold transition-all cursor-pointer",
                                    d.active
                                        ? "ring-2 ring-primary bg-primary/5 text-primary scale-105"
                                        : "bg-muted/5 border border-transparent hover:bg-muted/20 hover:border-border text-foreground/70"
                                )}
                            >
                                {d.day}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Visits */}
                <div className="bg-card border border-border rounded-[48px] p-10 shadow-soft">
                    <div className="flex items-center gap-3 mb-10">
                        <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-display font-black text-xl text-foreground uppercase tracking-tight">Próximas Visitas</h3>
                    </div>

                    <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-[40px] border-2 border-dashed border-muted">
                        <p className="text-muted-foreground font-black text-xs uppercase tracking-widest text-center px-10">Nenhuma visita agendada</p>
                        <Button variant="link" className="mt-4 text-primary font-black uppercase tracking-widest text-[10px] hover:no-underline hover:scale-105 transition-all">
                            Agendar primeira visita →
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
