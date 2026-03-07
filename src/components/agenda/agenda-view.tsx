"use client";

import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Building, Rocket, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Appointment {
    id: string;
    title: string;
    appointmentDate: string;
    appointmentTime: string | null;
    notes: string | null;
    status: string;
    lead?: any;
    property?: any;
    launch?: any;
}

interface AgendaViewProps {
    initialAppointments: Appointment[];
}

export function AgendaView({ initialAppointments }: AgendaViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const appointments = initialAppointments;

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD local

        const todayCount = appointments.filter(a => {
            try {
                return a.appointmentDate === todayStr;
            } catch (e) {
                return false;
            }
        }).length;

        // This week calculation
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const nextWeek = new Date(startOfToday);
        nextWeek.setDate(startOfToday.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);

        const weekCount = appointments.filter(a => {
            try {
                const [y, m, d] = a.appointmentDate.split('-').map(Number);
                const date = new Date(y, m - 1, d);
                return date >= startOfToday && date <= nextWeek;
            } catch (e) {
                return false;
            }
        }).length;

        const confirmedCount = appointments.filter(a => a.status === 'scheduled' || a.status === 'completed').length;
        const pendingCount = appointments.filter(a => a.status === 'scheduled').length;

        return [
            { label: "Hoje", value: todayCount.toString() },
            { label: "Esta Semana", value: weekCount.toString() },
            { label: "Confirmadas", value: confirmedCount.toString(), color: "text-success" },
            { label: "Pendentes", value: pendingCount.toString(), color: "text-warm" },
        ];
    }, [appointments]);

    // Calendar logic
    const monthYear = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const date = new Date(year, month, 1);
        const days = [];

        // Fill leading empty days
        const firstDay = date.getDay();
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null, active: false });
        }

        // Fill actual days
        const lastDay = new Date(year, month + 1, 0).getDate();
        const todayStr = new Date().toLocaleDateString('en-CA');

        for (let i = 1; i <= lastDay; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const hasAppointment = appointments.some(a => a.appointmentDate === dateStr);
            days.push({
                day: i,
                dateStr,
                active: hasAppointment,
                isToday: dateStr === todayStr
            });
        }
        return days;
    }, [currentDate, appointments]);

    const upcomingAppointments = useMemo(() => {
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA');

        return appointments
            .filter(a => {
                try {
                    return a.appointmentDate >= todayStr;
                } catch (e) {
                    return false;
                }
            })
            .sort((a, b) => {
                const dateCompare = a.appointmentDate.localeCompare(b.appointmentDate);
                if (dateCompare !== 0) return dateCompare;
                return (a.appointmentTime || '').localeCompare(b.appointmentTime || '');
            })
            .slice(0, 5);
    }, [appointments]);

    const changeMonth = (offset: number) => {
        const next = new Date(currentDate);
        next.setMonth(next.getMonth() + offset);
        setCurrentDate(next);
    };

    return (
        <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="card-premium p-8 flex flex-col gap-3 group hover:border-primary/20 transition-all">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block opacity-60 group-hover:opacity-100 transition-opacity">{stat.label}</span>
                        <div className={cn("text-4xl font-black tracking-tighter", stat.color || "text-foreground")}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 card-premium p-6 sm:p-10 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-all" />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
                        <div className="flex flex-col gap-1">
                            <h3 className="font-display font-black text-3xl text-foreground uppercase tracking-tight capitalize">
                                {monthYear}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                {appointments.length} Compromissos detectados
                            </div>
                        </div>
                        <div className="flex gap-4 w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 rounded-2xl bg-muted/20 hover:bg-muted btn-interactive flex-1 sm:flex-none"
                                onClick={() => changeMonth(-1)}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="h-12 rounded-2xl bg-muted/40 font-black text-[10px] uppercase tracking-widest px-8 btn-interactive hidden sm:block"
                                onClick={() => setCurrentDate(new Date())}
                            >
                                Hoje
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 rounded-2xl bg-muted/20 hover:bg-muted btn-interactive flex-1 sm:flex-none"
                                onClick={() => changeMonth(1)}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-3 sm:gap-6 mb-8 text-center">
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                            <div key={d} className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2 sm:gap-6">
                        {daysInMonth.map((d, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "aspect-square rounded-[18px] sm:rounded-[24px] flex items-center justify-center text-xs sm:text-sm font-black transition-all relative group/day",
                                    !d.day ? "invisible" : "visible",
                                    d.active
                                        ? "bg-primary text-white shadow-xl shadow-primary/30 scale-105 sm:scale-110 z-10"
                                        : "bg-muted/10 border border-transparent hover:bg-muted/30 hover:border-border/50 text-foreground/60",
                                    d.isToday && !d.active ? "border-primary/50 ring-2 ring-primary/10" : ""
                                )}
                            >
                                {d.active && <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-primary" />}
                                {d.day}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Visits */}
                <div className="card-premium p-6 sm:p-10 bg-muted/20 shadow-inner flex flex-col">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-card rounded-2xl border border-border/50 shadow-sm">
                            <CalendarIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-display font-black text-xl text-foreground uppercase tracking-tight">Próximas Visitas</h3>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map((app) => (
                                <div key={app.id} className="p-5 rounded-[28px] bg-card border border-border/40 hover:border-primary/30 transition-all group/item shadow-sm">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h4 className="text-sm font-black uppercase tracking-tight text-foreground line-clamp-1 group-hover/item:text-primary transition-colors">
                                            {app.title}
                                        </h4>
                                        <Badge variant="outline" className="rounded-full text-[8px] font-black px-2 py-0 h-5 border-border/50 opacity-60">
                                            {app.status === 'scheduled' ? 'Agendado' : app.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
                                            <Clock className="w-3 h-3 text-primary" />
                                            {(() => {
                                                const [y, m, d] = app.appointmentDate.split('-').map(Number);
                                                return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                                            })()}
                                            {app.appointmentTime && ` • ${app.appointmentTime.slice(0, 5)}`}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                <Clock className="h-12 w-12 mb-6" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum compromisso</p>
                            </div>
                        )}
                    </div>

                    <Button variant="link" className="text-primary font-black uppercase tracking-widest text-[9px] hover:no-underline group/btn flex items-center gap-2 mt-8 w-fit mx-auto" asChild>
                        <Link href="/leads">
                            Gerar Agenda com IA <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
