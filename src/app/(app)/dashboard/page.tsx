'use client';

import { useState, useEffect } from 'react';
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
    X,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LeadImobLogo } from "@/components/LeadImobLogo";
import { UserButton } from "@clerk/nextjs";

// Views
import { LeadsView } from "@/components/dashboard/leads-view";
import { CampaignsView } from "@/components/dashboard/campaigns-view";
import { OnboardingChecklist } from "@/components/onboarding-checklist";

// Actions
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getProfile } from "@/lib/actions/profile";

export default function DashboardPage() {
    const [statsData, setStatsData] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [s, p] = await Promise.all([
                    getDashboardStats(),
                    getProfile()
                ]);
                setStatsData(s);
                setProfile(p);
            } catch (error) {
                console.error("Dashboard load error:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const stats = statsData ? [
        { title: "Leads Ativos", value: statsData.leads.toString(), icon: Users, color: "text-primary", href: "/leads" },
        { title: "Lançamentos", value: statsData.launches.toString(), icon: Megaphone, color: "text-purple", href: "/lancamentos" },
        { title: "Agenda Hoje", value: statsData.appointmentsCount.toString(), icon: Calendar, color: "text-cyan", href: "/agenda" },
    ] : [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Carregando inteligência...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 animate-fade-up px-4 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="heading-xl tracking-tight text-foreground">
                        Olá, <span className="text-gradient-accent">{profile?.name || 'Corretor'}</span>
                    </h1>
                    <p className="text-body font-medium">Seu ecossistema de inteligência imobiliária está pronto.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md hover:bg-muted btn-interactive min-h-[48px] min-w-[48px]" asChild>
                        <Link href="/notificacoes">
                            <Bell className="w-5 h-5 text-muted-foreground" />
                            <span className="absolute top-3 right-3 sm:top-4 sm:right-4 w-2.5 h-2.5 bg-hot rounded-full border-2 border-card" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Bento Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

                {/* Left Column: Stats & Main Action */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                    {stats.map((stat) => (
                        <Link
                            key={stat.title}
                            href={stat.href}
                            className="group card-premium p-6 sm:p-8 flex items-center justify-between min-h-[120px]"
                        >
                            <div className="space-y-2 sm:space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-accent transition-colors">{stat.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter">{stat.value}</h3>
                                </div>
                            </div>
                            <div className={cn(
                                "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner group-hover:scale-110 group-hover:rotate-3",
                                "bg-muted/10",
                                stat.color
                            )}>
                                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                        </Link>
                    ))}

                    {/* Pro ativo Section - Bento Feature */}
                    <div className="sm:col-span-2 card-premium p-6 sm:p-10 bg-[#0F172A] border-none group overflow-hidden">
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none" />

                        <div className="flex flex-col md:flex-row gap-8 sm:gap-10 items-center justify-between relative z-10">
                            <div className="space-y-4 sm:space-y-6 flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/20">
                                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                    Qualificação Ativa
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase tracking-tighter">
                                    Raquel está <br />
                                    <span className="text-accent">Convertendo Leads</span>
                                </h3>
                                <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed max-w-sm">
                                    {statsData?.hotLeadsInsight > 0
                                        ? `Identificamos ${statsData.hotLeadsInsight} contatos com alta propensão de fechamento nas últimas 24h.`
                                        : "Tudo sob controle. A Raquel está monitorando novos interessados para o seu portfólio."
                                    }
                                </p>
                                <Button className="btn-premium w-full md:w-auto h-14 sm:h-16 text-xs sm:text-sm" asChild>
                                    <Link href="/leads">
                                        Monitorar Conversas
                                    </Link>
                                </Button>
                            </div>
                            <div className="hidden md:flex w-32 h-32 lg:w-40 lg:h-40 bg-accent/10 rounded-full items-center justify-center animate-pulse border border-accent/20 relative">
                                <div className="absolute inset-4 rounded-full border-2 border-dashed border-accent/30 animate-[spin_10s_linear_infinite]" />
                                <Megaphone className="w-10 h-10 lg:w-12 lg:h-12 text-accent" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar content in bento */}
                <div className="lg:col-span-4 space-y-6 md:space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <OnboardingChecklist />

                    {/* Próximos Compromissos */}
                    <div className="card-premium p-6 sm:p-10 space-y-6 sm:space-y-8 h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display font-black text-base sm:text-lg text-foreground uppercase tracking-tight flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-hot animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                Agenda
                            </h3>
                            <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest ring-1 ring-accent/20">Hoje</div>
                        </div>
                        <div className="space-y-4 sm:space-y-6">
                            {statsData?.appointments && statsData.appointments.length > 0 ? (
                                statsData.appointments.map((item: any, i: number) => (
                                    <Link key={i} href="/agenda" className="flex items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] bg-muted/5 border border-border/30 hover:bg-muted/10 transition-all cursor-pointer group shadow-sm hover:shadow-md min-h-[80px]">
                                        <div className={cn(
                                            "h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0 bg-accent/10 text-accent"
                                        )}>
                                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm sm:text-base font-black text-foreground truncate">{item.title}</span>
                                            <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{item.appointmentTime?.substring(0, 5)}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="py-10 text-center border border-dashed rounded-[32px] border-border/40">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sem compromissos hoje</p>
                                </div>
                            )}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 rounded-xl sm:rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:text-primary transition-all btn-interactive border border-border/30 min-h-[48px]" asChild>
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
