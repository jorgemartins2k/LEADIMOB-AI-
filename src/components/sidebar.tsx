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
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Meus Imóveis", href: "/imoveis", icon: Home },
    { name: "Lançamentos", href: "/lancamentos", icon: Megaphone },
    { name: "Agenda", href: "/agenda", icon: Calendar },
    { name: "Meus Leads", href: "/leads", icon: Users },
    { name: "Perfil", href: "/configuracoes/perfil", icon: Settings },
    { name: "Expediente", href: "/configuracoes/expediente", icon: Clock },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-surface border-r border-surface-2 transition-all duration-300 ease-in-out">
            <div className="flex h-20 items-center px-6">
                <span className="text-2xl font-display font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-text-muted hover:bg-surface-2 hover:text-text"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 shrink-0 transition-colors",
                                        isActive ? "text-primary" : "text-text-muted group-hover:text-text"
                                    )}
                                />
                                {item.name}
                            </div>
                            {isActive && <ChevronRight className="h-4 w-4 text-primary animate-in fade-in slide-in-from-left-2" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-surface-2">
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
                        <span className="text-sm font-medium text-text truncate max-w-[120px]">
                            Minha Conta
                        </span>
                        <span className="text-xs text-text-muted">Plano Start</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
