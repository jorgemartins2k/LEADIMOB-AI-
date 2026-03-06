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
        <header className="md:hidden sticky top-0 z-50 w-full bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 h-20 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
                <LeadImobLogo variant="dark" iconSize={28} fontSize="text-lg" />
            </Link>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:bg-white/10 rounded-xl"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 top-20 z-40 bg-[#020617] animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-purple/5 pointer-events-none" />

                    <nav className="h-full overflow-y-auto p-6 space-y-2 pb-32">
                        {navigation.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 px-6 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                        isActive
                                            ? "bg-white/10 text-white shadow-lg"
                                            : "text-slate-400 active:bg-white/5"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", isActive ? "text-accent" : "text-slate-500")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
}
