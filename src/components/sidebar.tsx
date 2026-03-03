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

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-background border-r border-border transition-all duration-300 ease-in-out">
            <div className="flex h-20 items-center px-6">
                <span className="text-2xl font-display font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Leadimob AI
                </span>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-4">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center justify-between rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95",
                                isActive
                                    ? "bg-primary text-white shadow-primary scale-[1.02]"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            {/* Sliding Active Indicator (Optional visual flair) */}
                            {isActive && (
                                <div className="absolute left-1 top-1/4 bottom-1/4 w-1 bg-accent rounded-full animate-in fade-in slide-in-from-left-2 duration-500" />
                            )}

                            <div className="flex items-center gap-4">
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110",
                                        isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />
                                {item.name}
                            </div>
                            {isActive ? (
                                <ChevronRight className="h-4 w-4 text-white/50 animate-in slide-in-from-left-4 duration-500" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2">
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "h-9 w-9 border border-primary/20 hover:border-primary/50 transition-colors",
                            },
                        }}
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                            Minha Conta
                        </span>
                        <span className="text-xs text-muted-foreground">Plano Start</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
