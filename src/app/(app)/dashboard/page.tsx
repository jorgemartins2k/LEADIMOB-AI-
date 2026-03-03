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
        <div className="space-y-10 pb-20 animate-fade-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="heading-xl text-foreground">
                        Olá, <span className="text-gradient-accent">Jorge Martins</span>
                    </h1>
                    <p className="text-body font-medium">Seu ecossistema de inteligência imobiliária está pronto.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="relative h-14 w-14 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md hover:bg-muted btn-interactive" asChild>
                        <Link href="/notificacoes">
                            <Bell className="w-5 h-5 text-muted-foreground" />
                            <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-hot rounded-full border-2 border-card" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Bento Grid Principal */}
            <div className="bento-grid">

                {/* Left Column: Stats & Main Action */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {stats.map((stat) => (
                        <Link
                            key={stat.title}
                            href={stat.href}
                            className="group card-premium p-8 flex items-center justify-between"
                        >
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-accent transition-colors">{stat.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-bold text-foreground tracking-tighter">{stat.value}</h3>
                                </div>
                            </div>
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner group-hover:scale-110 group-hover:rotate-3",
                                "bg-muted/10",
                                stat.color
                            )}>
                                <stat.icon className="h-8 w-8" />
                            </div>
                        </Link>
                    ))}

                    {/* Pro ativo Section - Bento Feature */}
                    <div className="md:col-span-2 card-premium p-10 bg-[#0F172A] border-none group">
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none" />

                        <div className="flex flex-col md:flex-row gap-10 items-center justify-between relative z-10">
                            <div className="space-y-6 flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/20">
                                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                    Qualificação Ativa
                                </div>
                                <h3 className="text-3xl font-bold text-white leading-tight uppercase tracking-tighter">
                                    Raquel está <br />
                                    <span className="text-accent">Convertendo Leads</span>
                                </h3>
                                <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                                    Identificamos 4 contatos com alta propensão de fechamento nos últimos 10 minutos.
                                </p>
                                <Button className="btn-premium w-full md:w-auto mt-4" asChild>
                                    <Link href="/leads">
                                        Monitorar Conversas
                                    </Link>
                                </Button>
                            </div>
                            <div className="hidden md:flex w-40 h-40 bg-accent/10 rounded-full items-center justify-center animate-pulse border border-accent/20 relative">
                                <div className="absolute inset-4 rounded-full border-2 border-dashed border-accent/30 animate-[spin_10s_linear_infinite]" />
                                <Megaphone className="w-12 h-12 text-accent" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar content in bento */}
                <div className="lg:col-span-4 space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <OnboardingChecklist />

                    {/* Próximos Compromissos */}
                    <div className="card-premium p-10 space-y-8 h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display font-black text-lg text-foreground uppercase tracking-tight flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-hot animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                Agenda
                            </h3>
                            <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-accent/20">Hoje</div>
                        </div>
                        <div className="space-y-6">
                            {[
                                { title: "Visita: Edifício Aurora", time: "14:30", client: "João Silva", type: "success" },
                                { title: "Call: Garden Concept", time: "16:00", client: "Maria Souza", type: "accent" }
                            ].map((item, i) => (
                                <Link key={i} href="/agenda" className="flex items-center gap-5 p-6 rounded-[32px] bg-muted/5 border border-border/30 hover:bg-muted/10 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner",
                                        item.type === "success" ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
                                    )}>
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-black text-foreground">{item.title}</span>
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1.5">{item.time} • {item.client}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:text-primary transition-all btn-interactive border border-border/30" asChild>
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
