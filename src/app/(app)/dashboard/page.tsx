import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, Megaphone, Calendar } from "lucide-react";
import { OnboardingChecklist } from "@/components/onboarding-checklist";

export default function DashboardPage() {
    const stats = [
        { title: "Leads Ativos", value: "24", icon: Users, color: "text-primary" },
        { title: "Meus Imóveis", value: "12", icon: Home, color: "text-secondary" },
        { title: "Lançamentos", value: "5", icon: Megaphone, color: "text-accent" },
        { title: "Agenda Hoje", value: "3", icon: Calendar, color: "text-primary-dark" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-display font-bold text-text">Olá, Corretor! 👋</h1>
                <p className="text-text-muted">A Raquel está cuidando de 24 leads para você hoje.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Stats and Chart */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {stats.map((stat) => (
                            <Card key={stat.title} className="bg-surface border-surface-2 hover:border-primary/50 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-text-muted">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-text">{stat.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="bg-surface border-surface-2">
                        <CardHeader>
                            <CardTitle className="font-display text-text">Atendimento em Tempo Real (Raquel)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] flex items-center justify-center text-text-muted border-2 border-dashed border-surface-2 rounded-lg bg-bg/20">
                                Gráfico de interações em tempo real
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    <OnboardingChecklist />

                    <Card className="bg-surface border-surface-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="font-display text-lg text-text">Próximos Compromissos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 p-3 rounded-xl bg-bg/50 border border-surface-2 hover:border-primary/30 transition-colors">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-text">Visita: Edifício Aurora</span>
                                        <span className="text-xs text-text-muted">14:30 - Lead: João Silva</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-xl bg-bg/50 border border-surface-2 hover:border-secondary/30 transition-colors">
                                    <div className="h-2 w-2 rounded-full bg-secondary" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-text">Call: Lançamento Garden</span>
                                        <span className="text-xs text-text-muted">16:00 - Lead: Maria Souza</span>
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
