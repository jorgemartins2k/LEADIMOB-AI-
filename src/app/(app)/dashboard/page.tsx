'use client';

import { useState } from 'react';
import Link from 'next/link';
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
export default function DashboardPage() {
    const stats = [
        { title: "Leads Ativos", value: "24", icon: Users, color: "text-primary", href: "/leads" },
        { title: "Meus Imóveis", value: "12", icon: HomeIcon, color: "text-accent", href: "/imoveis" },
        { title: "Lançamentos", value: "5", icon: Megaphone, color: "text-purple", href: "/lancamentos" },
        { title: "Agenda Hoje", value: "3", icon: Calendar, color: "text-cyan", href: "/agenda" },
    ];

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="heading-xl text-foreground">
                        Olá, <span className="text-gradient-accent">Jorge Martins</span>
                    </h1>
                    <p className="text-body">Bem-vindo de volta ao seu centro de comando imobiliário.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="relative h-14 w-14 rounded-2xl bg-card border border-border/50 shadow-soft hover:bg-muted btn-interactive" asChild>
                        <Link href="/notificacoes">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-hot rounded-full border-2 border-card" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Bento Grid Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">

                {/* Stats Section */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stats.map((stat) => (
                        <Link
                            key={stat.title}
                            href={stat.href}
                            className="group card-premium p-8 flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer"
                        >
                            <div className="space-y-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-accent transition-colors">{stat.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-bold text-foreground tracking-tighter">{stat.value}</h3>
                                </div>
                            </div>
                            <div className={`p-4 rounded-2xl bg-muted/30 ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                                <stat.icon className="h-7 w-7" />
                            </div>
                        </Link>
                    ))}

                    {/* Pro ativo Section - Bento Large */}
                    <div className="md:col-span-2 card-premium p-10 bg-primary relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-10 blur-3xl -z-10 group-hover:opacity-20 transition-opacity" />

                        <div className="flex flex-col md:flex-row gap-10 items-center justify-between relative z-10">
                            <div className="space-y-6 flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/30">
                                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                    Atendimento em Tempo Real
                                </div>
                                <h3 className="text-3xl font-bold text-white leading-tight uppercase tracking-tighter">
                                    A Raquel está <br />
                                    <span className="text-accent underline underline-offset-8 decoration-accent/30">Qualificando agora</span>
                                </h3>
                                <p className="text-white/60 font-medium leading-relaxed max-w-md">
                                    4 contatos ativos nos últimos 5 minutos. <br />
                                    Fique atento às notificações de Propensão Alta.
                                </p>
                                <Button className="btn-primary bg-white text-primary hover:bg-white/90 h-14 px-10 text-xs font-semibold uppercase tracking-wider rounded-2xl btn-interactive" asChild>
                                    <Link href="/leads">
                                        Ver Conversas Ativas
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <OnboardingChecklist />

                    {/* Próximos Compromissos */}
                    <div className="card-premium p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display font-black text-lg text-foreground uppercase tracking-tight flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-hot animate-pulse" />
                                Compromissos
                            </h3>
                            <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-accent/20">Hoje</div>
                        </div>
                        <div className="space-y-6">
                            <Link href="/agenda" className="flex items-center gap-5 p-6 rounded-[32px] bg-muted/20 border border-border/50 hover:bg-muted/40 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-black text-foreground">Visita: Edifício Aurora</span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1.5">14:30 • João Silva</span>
                                </div>
                            </Link>
                            <Link href="/agenda" className="flex items-center gap-5 p-6 rounded-[32px] bg-muted/20 border border-border/50 hover:bg-muted/40 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-black text-foreground">Call: Garden Lançamento</span>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1.5">16:00 • Maria Souza</span>
                                </div>
                            </Link>
                        </div>
                        <Button variant="ghost" className="w-full mt-4 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:text-primary transition-all btn-interactive" asChild>
                            <Link href="/agenda">
                                Ver Agenda Completa
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
