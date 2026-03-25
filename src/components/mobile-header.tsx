"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Users, Home, Rocket, Calendar, Megaphone, Clock, Bell, Settings, LogOut } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { LeadImobLogo } from "./LeadImobLogo";
import { Button } from "./ui/button";
import { getProfile } from "@/lib/actions/profile";

const navigation = [
    { name: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/leads", icon: Users },
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
    const [profile, setProfile] = useState<{ name: string; avatarUrl: string | null } | null>(null);

    useEffect(() => {
        async function loadProfile() {
            const data = await getProfile();
            if (data) {
                setProfile({
                    name: data.name,
                    avatarUrl: data.avatarUrl
                });
            }
        }
        loadProfile();
    }, []);

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
            "md:hidden sticky top-0 z-[100] w-full transition-all duration-300 px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between",
            isOpen
                ? "bg-[#020617] border-b border-white/10"
                : "bg-[#020617]/95 backdrop-blur-xl border-b border-white/5"
        )}>
            <Link href="/dashboard" className="flex items-center gap-2">
                <LeadImobLogo variant="dark" iconSize={26} fontSize="text-base sm:text-lg" />
            </Link>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:bg-white/10 rounded-xl relative z-[110] min-h-[44px] min-w-[44px]"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Mobile Menu Overlay */}
            <div className={cn(
                "fixed inset-0 top-0 pt-16 sm:pt-20 z-[90] bg-[#020617] transition-all duration-500 ease-in-out transform",
                isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
            )}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.05),transparent_50%)] pointer-events-none" />

                <nav className="h-full overflow-y-auto p-4 sm:p-6 space-y-1 pb-32 relative z-10">
                    <div className="mb-4 px-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Menu Principal</p>
                    </div>
                    {navigation.map((item, index) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                style={{ transitionDelay: `${index * 30}ms` }}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-[24px] sm:rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative min-h-[52px]",
                                    isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-blue-400" : "text-slate-500")} />
                                <span className="relative">
                                    {item.name}
                                    {isActive && (
                                        <div className="absolute -bottom-1.5 left-0 w-1/2 h-0.5 bg-blue-500/50 rounded-full" />
                                    )}
                                </span>
                                {isActive && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                                )}
                            </Link>
                        );
                    })}

                    <div className="mt-8 pt-8 border-t border-white/5 px-2 sm:px-4">
                        <div className="bg-white/5 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 flex items-center gap-4 border border-white/5 shadow-2xl">
                            <div className="relative">
                                {profile?.avatarUrl ? (
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-white/10 overflow-hidden">
                                        <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <UserButton
                                        afterSignOutUrl="/"
                                        appearance={{
                                            elements: {
                                                userButtonAvatarBox: "h-12 w-12 sm:h-14 sm:w-14 border-2 border-white/10 hover:border-blue-500/50 transition-all duration-300",
                                            },
                                        }}
                                    />
                                )}
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#020617] pointer-events-none" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm sm:text-base font-black text-white leading-none">{profile?.name || "Carregando..."}</p>
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Plano Pro</span>
                                </div>
                            </div>
                            <div className="ml-auto">
                                <Button variant="ghost" className="h-10 w-10 text-slate-500 hover:text-hot hover:bg-hot/10 rounded-full" onClick={() => { }}>
                                    <LogOut className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}
