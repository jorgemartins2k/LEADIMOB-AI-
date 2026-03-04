"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Home,
    Megaphone,
    Calendar,
    Users,
    Settings,
    ChevronRight,
    LogOut,
    Clock,
    Rocket,
    Bell,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const navigation = [
    { name: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Imóveis", href: "/imoveis", icon: Home },
    { name: "Lançamentos", href: "/lancamentos", icon: Rocket },
    { name: "Eventos", href: "/eventos", icon: Calendar },
    { name: "Campanhas", href: "/campanhas", icon: Megaphone },
    { name: "Calendário", href: "/agenda", icon: Clock },
    { name: "Notificações", href: "/notificacoes", icon: Bell },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
];

import { LeadImobLogo } from "@/components/LeadImobLogo";

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-72 flex-col bg-[#020617] border-r border-white/5 transition-all duration-500 ease-in-out relative overflow-hidden group/sidebar">
            {/* Background Flair */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-48 -right-24 w-48 h-48 bg-purple/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Brand Logo Section */}
            <div className="flex h-24 items-center px-8 relative z-10">
                <Link href="/dashboard" className="flex items-center gap-3 group/logo">
                    <LeadImobLogo variant="dark" iconSize={36} fontSize="text-xl" />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1.5 px-6 py-6 relative z-10">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center justify-between rounded-2xl px-6 py-4.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 active:scale-95",
                                isActive
                                    ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 shrink-0 transition-all duration-500",
                                        isActive ? "text-accent scale-110" : "text-slate-500 group-hover:text-white group-hover:scale-110"
                                    )}
                                />
                                <span className="relative">
                                    {item.name}
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-0 w-4 h-0.5 bg-accent rounded-full animate-in slide-in-from-left-4 duration-500" />
                                    )}
                                </span>
                            </div>

                            {isActive ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-6 relative z-10">
                <div className="p-4 rounded-[28px] bg-white/5 border border-white/5 backdrop-blur-lg hover:border-white/10 transition-all duration-500 group/user">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "h-11 w-11 border-2 border-white/10 hover:border-accent/50 transition-all duration-500",
                                    },
                                }}
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-[#020617] shadow-sm" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate group-hover/user:text-accent transition-colors">
                                Jorge Martins
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-md border border-white/5">Plano Pro</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
