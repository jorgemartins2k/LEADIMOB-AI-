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
                                "group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-primary/20 shadow-lg"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 shrink-0 transition-colors",
                                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />
                                {item.name}
                            </div>
                            {isActive && <ChevronRight className="h-4 w-4 text-primary-foreground animate-in fade-in slide-in-from-left-2" />}
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
