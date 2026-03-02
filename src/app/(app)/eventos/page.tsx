import { Plus, Search, Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEvents, deleteEvent } from "@/lib/actions/events";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function EventsPage() {
    const events = await getEvents().catch(() => []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-2 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-text">Eventos</h1>
                    <p className="text-text-muted text-sm text-accent opacity-80 font-medium">Workshops, Open Houses e Lançamentos Especiais.</p>
                </div>
                <Link href="/eventos/novo">
                    <Button className="bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 px-6 h-11">
                        <Plus className="h-4 w-4 mr-2" /> Novo Evento
                    </Button>
                </Link>
            </div>

            {/* Grid section */}
            {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-surface-2 rounded-3xl bg-surface/30">
                    <div className="h-16 w-16 bg-surface-2 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-text-muted opacity-30" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-text">Nenhum evento agendado</h3>
                    <p className="text-text-muted mt-2 max-w-sm text-center">
                        Crie eventos para engajar seus leads e aumentar suas conversões com a ajuda da Raquel.
                    </p>
                    <Link href="/eventos/novo" className="mt-6">
                        <Button variant="link" className="text-primary font-bold">
                            Criar evento agora
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <Card key={event.id} className="bg-surface border-surface-2 group hover:border-primary/40 transition-all duration-300">
                            <CardHeader className="p-5 pb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold border-primary/20 bg-primary/5 text-primary">
                                        {event.standard || "Médio"}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl font-display font-bold text-text line-clamp-1">{event.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 pt-2 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-text-muted">
                                    <Calendar className="h-4 w-4 text-secondary" />
                                    <span>{new Date(event.eventDate).toLocaleDateString()} {event.eventTime ? `às ${event.eventTime}` : ""}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-text-muted">
                                    <MapPin className="h-4 w-4 text-accent" />
                                    <span className="truncate">{event.location || "Local não informado"}</span>
                                </div>
                                <div className="pt-2 border-t border-surface-2">
                                    <p className="text-xs text-text-muted line-clamp-2 italic">{event.description || "Sem descrição..."}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="p-5 pt-0 border-t border-surface-2/10 mt-2">
                                <Button variant="ghost" size="sm" className="w-full text-xs font-bold uppercase tracking-wider text-text-muted hover:text-primary transition-colors">
                                    Ver Detalhes
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
