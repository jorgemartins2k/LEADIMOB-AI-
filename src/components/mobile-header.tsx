"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Users, Home, Rocket, Calendar, Megaphone, Clock, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadImobLogo } from "./LeadImobLogo";
import { Button } from "./ui/button";

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

export function MobileHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    return (
        <header className={cn(
            "md:hidden sticky top-0 z-[100] w-full transition-all duration-300 px-6 h-20 flex items-center justify-between",
            isOpen
                ? "bg-[#020617] border-b border-white/10"
                : "bg-[#020617]/80 backdrop-blur-xl border-b border-white/5"
        )}>
            <Link href="/dashboard" className="flex items-center gap-2">
                <LeadImobLogo variant="dark" iconSize={28} fontSize="text-lg" />
            </Link>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:bg-white/10 rounded-xl relative z-[110]"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Mobile Menu Overlay */}
            <div className={cn(
                "fixed inset-0 top-0 pt-20 z-[90] bg-[#020617] transition-all duration-500 ease-in-out transform",
                isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
            )}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.05),transparent_50%)] pointer-events-none" />

                <nav className="h-full overflow-y-auto p-6 space-y-1 pb-32 relative z-10">
                    <div className="mb-4 px-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Menu Principal</p>
                    </div>
                    {navigation.map((item, index) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                style={{ transitionDelay: `${index * 40}ms` }}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300",
                                    isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
                                    isActive
                                        ? "bg-white/10 text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] border border-white/5"
                                        : "text-slate-400 hover:text-white hover:bg-white/5 active:scale-[0.98]"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                    isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-slate-500"
                                )}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                {item.name}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </Link>
                        );
                    })}

                    <div className="mt-8 pt-8 border-t border-white/5 px-4 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center text-white font-bold">
                                JM
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Jorge Martins</p>
                                <p className="text-xs text-slate-500">Corretor Premium</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 h-12 rounded-xl">
                            Sair do sistema
                        </Button>
                    </div>
                </nav>
            </div>
        </header>
    );
}
