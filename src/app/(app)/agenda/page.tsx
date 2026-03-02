import { Plus, Calendar as CalendarIcon, Clock, MapPin, User, Building2, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAppointments } from "@/lib/actions/appointments";
import { getEvents } from "@/lib/actions/events";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function AgendaPage() {
    const [appointments, events] = await Promise.all([
        getAppointments().catch(() => []),
        getEvents().catch(() => []),
    ]);

    // Combine and sort by date
    const allItems = [
        ...appointments.map(a => ({ ...a, type: 'appointment' as const, location: null })),
        ...events.map(e => ({ ...e, type: 'event' as const, appointmentDate: e.eventDate, appointmentTime: e.eventTime, title: e.name })),
    ].sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-2 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-text">Agenda</h1>
                    <p className="text-text-muted text-sm italic opacity-80 underline underline-offset-4 decoration-primary/30 decoration-2">Seus compromissos e eventos em um só lugar.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/agenda/novo">
                        <Button variant="outline" className="border-surface-2 bg-surface/50 hover:bg-surface text-xs font-bold uppercase tracking-wider">
                            <Plus className="h-4 w-4 mr-2 text-primary" /> Agendamento
                        </Button>
                    </Link>
                    <Link href="/eventos/novo">
                        <Button className="bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 px-6 h-11 text-xs font-bold uppercase tracking-wider">
                            <Plus className="h-4 w-4 mr-2" /> Novo Evento
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Sidebar (Mock for now) */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-surface border-surface-2 p-4">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="font-display font-bold">Março 2026</h2>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">{"<"}</Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">{">"}</Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-text-muted uppercase mb-2">
                            {["D", "S", "T", "Q", "Q", "S", "S"].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 31 }).map((_, i) => (
                                <Button
                                    key={i}
                                    variant="ghost"
                                    className={cn(
                                        "h-9 w-full p-0 font-medium rounded-lg hover:bg-primary/10 hover:text-primary transition-all",
                                        i + 1 === 2 ? "bg-primary text-white hover:bg-primary-dark" : "text-text"
                                    )}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-surface border-surface-2 overflow-hidden shadow-xl shadow-black/10">
                        <CardHeader className="bg-accent/5 border-b border-surface-2">
                            <CardTitle className="text-sm font-display uppercase tracking-widest text-accent flex items-center gap-2">
                                <Info className="h-4 w-4" /> Legenda
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <span>Agendamentos (Visitas/Calls)</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                <div className="h-2 w-2 rounded-full bg-accent" />
                                <span>Eventos (Workshops/Lançamentos)</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Timeline / List View */}
                <div className="lg:col-span-2 space-y-4">
                    {allItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-surface-2 rounded-3xl bg-surface/30">
                            <CalendarIcon className="h-12 w-12 text-text-muted opacity-20 mb-4" />
                            <h3 className="text-lg font-display font-semibold text-text opacity-40">Tudo limpo por aqui!</h3>
                            <p className="text-xs text-text-muted mt-1 uppercase tracking-tighter">Nenhum compromisso para os próximos dias.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {allItems.map((item, idx) => (
                                <div key={item.id} className="relative pl-8 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    {/* Timeline line */}
                                    {idx !== allItems.length - 1 && (
                                        <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-surface-2" />
                                    )}
                                    <div className={cn(
                                        "absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-bg flex items-center justify-center shadow-lg",
                                        item.type === 'appointment' ? "bg-primary" : "bg-accent"
                                    )}>
                                        {item.type === 'appointment' ? <Clock className="h-2.5 w-2.5 text-white" /> : <CalendarIcon className="h-2.5 w-2.5 text-white" />}
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-surface border border-surface-2 hover:border-primary/30 transition-all group shadow-sm">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] uppercase font-black tracking-tighter px-1.5 py-0 border-transparent",
                                                    item.type === 'appointment' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                                                )}>
                                                    {item.type === 'appointment' ? "Agendamento" : "Evento"}
                                                </Badge>
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">
                                                    {new Date(item.appointmentDate).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                                                    {item.appointmentTime && ` • ${item.appointmentTime}`}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-display font-bold text-text group-hover:text-primary transition-colors">{item.title}</h3>
                                            {item.location && (
                                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{item.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                                                <User className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-danger/10 hover:text-danger transition-all">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
