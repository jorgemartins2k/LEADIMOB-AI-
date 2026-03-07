"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getEvents } from "@/lib/actions/events";
import { EventsList } from "@/components/events/events-list";

export default function EventosPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getEvents();
                setEvents(data || []);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="heading-xl text-foreground">Eventos de <span className="text-gradient-accent">Conversão</span></h1>
                    <p className="text-body font-medium leading-relaxed">Organize feirões e lançamentos com captação automática pela <span className="text-foreground font-black">Raquel</span>.</p>
                </div>
                <Button className="btn-primary h-16 px-10 font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all shadow-primary/20" asChild>
                    <Link href="/eventos/novo">
                        <Plus className="h-5 w-5" /> Novo Evento
                    </Link>
                </Button>
            </div>

            {/* Section Title */}
            <div className="flex items-center gap-4 pt-10 border-t border-border/50">
                <div className="p-3 bg-muted/20 rounded-2xl">
                    <Calendar className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-display font-black text-2xl text-foreground uppercase tracking-tight">Próximas Iniciativas</h3>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="h-12 w-12 text-primary animate-spin opacity-20" />
                </div>
            ) : (
                <EventsList initialEvents={events} />
            )}
        </div>
    );
}
