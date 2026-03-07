"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAppointments } from "@/lib/actions/appointments";
import { AgendaView } from "@/components/agenda/agenda-view";

export default function AgendaPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await getAppointments();
                setAppointments(data || []);
            } catch (error) {
                console.error("Error fetching appointments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="heading-xl text-foreground">Agenda de <span className="text-gradient-accent">Visitas</span></h1>
                    <p className="text-body font-medium leading-relaxed">Gerencie seus compromissos e as visitas agendadas automaticamente pela <span className="text-foreground font-black">Raquel</span>.</p>
                </div>
                <Button className="btn-primary h-16 px-10 font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all shadow-primary/20" asChild>
                    <Link href="/agenda/novo">
                        <Plus className="h-5 w-5" /> Agendar Compromisso
                    </Link>
                </Button>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="h-12 w-12 text-primary animate-spin opacity-20" />
                </div>
            ) : (
                <AgendaView initialAppointments={appointments} />
            )}
        </div>
    );
}
