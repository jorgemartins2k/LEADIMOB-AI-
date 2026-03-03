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
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'leads', label: 'Leads', icon: Users },
        { id: 'campaigns', label: 'Campanhas', icon: Megaphone },
        { id: 'agenda', label: 'Minha Agenda', icon: Calendar },
        { id: 'properties', label: 'Meus Imóveis', icon: HomeIcon },
        { id: 'settings', label: 'Configurações', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-bg relative">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-24 flex items-center px-8 border-b border-border">
                    <LeadImobLogo />
                </div>

                <nav className="p-6 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setSidebarOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all",
                                activeTab === item.id
                                    ? "bg-primary text-white shadow-primary scale-[1.02]"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-border bg-card">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <UserButton afterSignOutUrl="/" />
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-widest text-foreground">Conta Ativa</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Plano PRO</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-24 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </Button>
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" className="relative rounded-xl">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-hot rounded-full border-2 border-card" />
                        </Button>
                    </div>
                </header>

                <main className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
                    {activeTab === 'overview' && <Overview />}
                    {activeTab === 'leads' && <LeadsView />}
                    {activeTab === 'campaigns' && <CampaignsView />}
                    {/* Fallback for components not yet fully implemented in this tab structure */}
                    {['agenda', 'properties', 'settings'].includes(activeTab) && (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-[32px] bg-muted/30 flex items-center justify-center mb-6">
                                <Menu className="w-10 h-10 text-muted-foreground opacity-20" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Em Construção</h3>
                            <p className="text-muted-foreground font-medium max-w-sm">Estamos migrando esta funcionalidade para o novo Design System v2.0.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
