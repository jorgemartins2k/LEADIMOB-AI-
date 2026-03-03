import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, Megaphone, Calendar } from "lucide-react";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const stats = [
        { title: "Leads Ativos", value: "24", icon: Users, color: "text-primary" },
        { title: "Meus Imóveis", value: "12", icon: Home, color: "text-accent" },
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
                {/* Main Stats and Chart */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {stats.map((stat) => (
                            <Card key={stat.title} className="card-hover bg-card border-border">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="bg-card border-border overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border">
                            <CardTitle className="font-display text-foreground">Atendimento em Tempo Real (Raquel)</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="h-[240px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-2xl bg-muted/10">
                                <Megaphone className="w-12 h-12 mb-4 opacity-20" />
                                <span className="font-medium">Gráfico de interações em tempo real</span>
                                <span className="text-xs opacity-60 mt-1">Sincronizando com WhatsApp...</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    <OnboardingChecklist />

                    <Card className="bg-card border-border shadow-soft">
                        <CardHeader className="pb-3 border-b border-border mb-4">
                            <CardTitle className="font-display text-lg text-foreground">Próximos Compromissos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border hover:border-primary/30 transition-all cursor-pointer">
                                    <div className="h-3 w-3 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-foreground">Visita: Edifício Aurora</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> 14:30 - Lead: João Silva
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border hover:border-accent/30 transition-all cursor-pointer">
                                    <div className="h-3 w-3 rounded-full bg-accent shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-foreground">Call: Lançamento Garden</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> 16:00 - Lead: Maria Souza
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
