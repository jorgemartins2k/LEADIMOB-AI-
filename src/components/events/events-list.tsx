"use client";

import { Calendar, MapPin, Trash2, Loader2, AlertTriangle, Building2, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteEvent } from "@/lib/actions/events";
import { toast } from "sonner";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface Event {
    id: string;
    name: string;
    eventDate: string;
    eventTime: string | null;
    location: string | null;
    description: string | null;
    targetAudience: string[];
    standard: string | null;
}

interface EventsListProps {
    initialEvents: Event[];
}

export function EventsList({ initialEvents }: EventsListProps) {
    const [eventsList, setEventsList] = useState(initialEvents);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            const result = await deleteEvent(id);
            if (result.success) {
                setEventsList((prev) => prev.filter((e) => e.id !== id));
                toast.success("Evento excluído com sucesso.");
            } else {
                toast.error("Erro ao excluir evento.");
            }
        } catch (error) {
            toast.error("Erro inesperado ao excluir evento.");
        } finally {
            setIsDeleting(null);
        }
    };

    if (eventsList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 rounded-[56px] border-4 border-dashed border-muted/50 bg-muted/5 group hover:border-primary/30 transition-all duration-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-3xl bg-muted/30 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                        <Calendar className="h-12 w-12 text-muted-foreground opacity-30" />
                    </div>
                    <h3 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4 text-center">Nenhum evento detectado</h3>
                    <p className="text-muted-foreground font-bold max-w-sm text-center text-sm mb-12 opacity-60 leading-relaxed">
                        Seu calendário de eventos está vazio. Crie um <span className="text-foreground">Lançamento</span> ou <span className="text-foreground">Open House</span> para impulsionar suas vendas.
                    </p>
                    <Button className="btn-primary px-12 h-16 rounded-[24px] shadow-2xl hover:scale-105 active:scale-95 transition-all font-black uppercase text-[10px] tracking-widest bg-foreground text-background" asChild>
                        <Link href="/eventos/novo">
                            Novo Evento
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const standardMeta = {
        economico: { label: "Econômico", icon: Building2, color: "bg-blue-500/10 text-blue-500" },
        medio: { label: "Padrão Médio", icon: Home, color: "bg-purple-500/10 text-purple-500" },
        alto: { label: "Alto Padrão", icon: Sparkles, color: "bg-accent/10 text-accent" },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsList.map((event) => {
                const std = standardMeta[event.standard as keyof typeof standardMeta] || standardMeta.medio;
                return (
                    <div key={event.id} className="card-premium p-8 space-y-6 relative group border-border/40 hover:border-primary/40 transition-all duration-500 overflow-hidden">
                        {/* Status / Standard Badge */}
                        <div className="flex items-center justify-between">
                            <Badge className={cn("border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider", std.color)}>
                                <std.icon className="w-3 h-3 mr-2" />
                                {std.label}
                            </Badge>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-[32px] border-border/50 bg-card p-8">
                                    <AlertDialogHeader className="space-y-4">
                                        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-2 mx-auto sm:mx-0">
                                            <AlertTriangle className="h-8 w-8" />
                                        </div>
                                        <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Excluir Evento?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground font-medium">
                                            Esta ação não pode ser desfeita. O evento <span className="text-foreground font-black">"{event.name}"</span> será removido permanentemente.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-8 gap-3">
                                        <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-border/50 bg-muted/10">Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDelete(event.id)}
                                            className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-destructive text-white hover:bg-destructive/90"
                                            disabled={isDeleting === event.id}
                                        >
                                            {isDeleting === event.id ? <Loader2 className="animate-spin h-5 w-5" /> : "Confirmar Exclusão"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        {/* Event Content */}
                        <div className="space-y-3">
                            <h4 className="text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {event.name}
                            </h4>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-70">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(event.eventDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    {event.eventTime && ` • ${event.eventTime.slice(0, 5)}`}
                                </div>
                                {event.location && (
                                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-70">
                                        <MapPin className="h-3.5 w-3.5 text-accent" />
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description Preview */}
                        {event.description && (
                            <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed font-medium">
                                {event.description}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
