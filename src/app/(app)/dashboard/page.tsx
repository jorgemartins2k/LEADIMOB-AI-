'use client';

import { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Home as HomeIcon,
    Megaphone,
    Calendar,
    Settings,
    Bell,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LeadImobLogo } from "@/components/LeadImobLogo";
import { UserButton } from "@clerk/nextjs";

// Views
import { LeadsView } from "@/components/dashboard/leads-view";
import { CampaignsView } from "@/components/dashboard/campaigns-view";
import { OnboardingChecklist } from "@/components/onboarding-checklist";

// Default Overview Content (What was there before)
function Overview() {
    const stats = [
        { title: "Leads Ativos", value: "24", icon: Users, color: "text-primary" },
        { title: "Meus Imóveis", value: "12", icon: HomeIcon, color: "text-accent" },
        { title: "Lançamentos", value: "5", icon: Megaphone, color: "text-purple" },
        { title: "Agenda Hoje", value: "3", icon: Calendar, color: "text-cyan" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="heading-xl text-foreground">Olá, Corretor! 👋</h1>
                <p className="text-body">A Raquel está cuidando de 24 leads para você hoje.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {stats.map((stat) => (
                            <div key={stat.title} className="bg-card border border-border p-6 rounded-[32px] shadow-soft card-hover">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</span>
                                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                                </div>
                                <div className="text-4xl font-black text-foreground">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-soft">
                        <div className="p-8 border-b border-border bg-muted/10">
                            <h3 className="font-display font-black text-xl text-foreground uppercase tracking-tight">Atendimento em Tempo Real (Raquel)</h3>
                        </div>
                        <div className="p-10">
                            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border-4 border-dashed border-muted rounded-[32px] bg-muted/5">
                                <Megaphone className="w-16 h-16 mb-6 opacity-20" />
                                <span className="font-black text-lg uppercase tracking-widest">Sincronizando WhatsApp...</span>
                                <span className="text-xs font-bold opacity-40 mt-2">RAQUEL AI ESTÁ ONLINE</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <OnboardingChecklist />

                    <div className="bg-card border border-border rounded-[40px] p-8 shadow-soft">
                        <h3 className="font-display font-black text-lg text-foreground uppercase tracking-tight mb-6 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-hot animate-pulse" />
                            Próximos Compromissos
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-5 rounded-[24px] bg-muted/20 border border-border hover:border-primary/30 transition-all cursor-pointer group">
                                <div className="h-10 w-10 rounded-2xl bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-foreground">Visita: Edifício Aurora</span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">14:30 • João Silva</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-5 rounded-[24px] bg-muted/20 border border-border hover:border-accent/30 transition-all cursor-pointer group">
                                <div className="h-10 w-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-foreground">Call: Garden Lançamento</span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">16:00 • Maria Souza</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const stats = [
        { title: "Leads Ativos", value: "24", icon: Users, color: "text-primary" },
        { title: "Meus Imóveis", value: "12", icon: HomeIcon, color: "text-accent" },
        { title: "Lançamentos", value: "5", icon: Megaphone, color: "text-purple" },
        { title: "Agenda Hoje", value: "3", icon: Calendar, color: "text-cyan" },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="heading-hero text-foreground">Olá, Corretor! 👋</h1>
                    <p className="text-body text-lg">A Raquel está cuidando de 24 leads para você hoje.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="relative rounded-2xl h-12 w-12 bg-card border border-border shadow-soft">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-hot rounded-full border-2 border-card" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {stats.map((stat) => (
                            <div key={stat.title} className="bg-card border border-border p-8 rounded-[40px] shadow-soft card-hover relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <stat.icon className="w-24 h-24 rotate-12" />
                                </div>
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.title}</span>
                                    <div className={cn("p-2 rounded-xl bg-muted/50", stat.color)}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="text-5xl font-black text-foreground tracking-tighter">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-card border border-border rounded-[48px] overflow-hidden shadow-soft">
                        <div className="p-10 border-b border-border bg-muted/5 flex items-center justify-between">
                            <h3 className="font-display font-black text-xl text-foreground uppercase tracking-tight">Atendimento em Tempo Real (Raquel)</h3>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                Online
                            </div>
                        </div>
                        <div className="p-12">
                            <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground border-4 border-dashed border-muted/50 rounded-[40px] bg-muted/5 group hover:border-primary/20 transition-all duration-500">
                                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Megaphone className="w-10 h-10 text-primary opacity-40" />
                                </div>
                                <span className="font-black text-xl uppercase tracking-[0.2em] text-foreground/50">Sincronizando WhatsApp...</span>
                                <span className="text-xs font-bold opacity-40 mt-3">RAQUEL AI ESTÁ PROCESSANDO CONVERSAS</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <OnboardingChecklist />

                    <div className="bg-card border border-border rounded-[48px] p-10 shadow-soft">
                        <h3 className="font-display font-black text-lg text-foreground uppercase tracking-tight mb-8 flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-hot animate-pulse" />
                            Próximos Compromissos
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-5 p-6 rounded-[32px] bg-muted/20 border border-border hover:border-primary/30 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-black text-foreground">Visita: Edifício Aurora</span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1.5">14:30 • João Silva</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 p-6 rounded-[32px] bg-muted/20 border border-border hover:border-accent/30 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-black text-foreground">Call: Garden Lançamento</span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1.5">16:00 • Maria Souza</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full mt-8 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:text-primary transition-all">
                            Ver Agenda Completa
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
