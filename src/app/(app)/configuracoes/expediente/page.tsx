"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveWorkSchedules } from "@/lib/actions/schedule";
import {
    X,
    Loader2,
    Save,
    Clock,
    Calendar,
    Sparkles,
    ShieldCheck,
    Zap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const daysOfWeek = [
    { id: 1, label: "Segunda", icon: Zap },
    { id: 2, label: "Terça", icon: Zap },
    { id: 3, label: "Quarta", icon: Zap },
    { id: 4, label: "Quinta", icon: Zap },
    { id: 5, label: "Sexta", icon: Zap },
    { id: 6, label: "Sábado", icon: Clock },
    { id: 0, label: "Domingo", icon: Clock },
];

const scheduleSchema = z.object({
    schedules: z.array(z.object({
        dayOfWeek: z.number(),
        startTime: z.string(),
        endTime: z.string(),
        isActive: z.boolean(),
    })),
});

export default function WorkSchedulePage() {
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm({
        resolver: zodResolver(scheduleSchema),
        defaultValues: {
            schedules: daysOfWeek.map(day => ({
                dayOfWeek: day.id,
                startTime: "09:00",
                endTime: "18:00",
                isActive: day.id !== 0 && day.id !== 6,
            })),
        },
    });

    const onSubmit = async (data: z.infer<typeof scheduleSchema>) => {
        setIsSaving(true);
        try {
            await saveWorkSchedules(data.schedules);
            // In a real app, use a toast here
        } catch (error) {
            console.error("Error saving schedule:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent py-12 animate-fade-up">
            <div className="max-w-3xl mx-auto">
                <div className="card-premium border-none shadow-2xl relative">
                    {/* Modal Header */}
                    <div className="px-10 py-8 border-b border-border/50 flex items-center justify-between bg-white/[0.02]">
                        <div className="space-y-1">
                            <h1 className="heading-xl text-foreground">Expediente</h1>
                            <p className="text-body text-sm font-medium">Defina quando a Raquel deve atuar.</p>
                        </div>
                        <Link href="/configuracoes">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted btn-interactive">
                                <X className="h-6 w-6 text-muted-foreground" />
                            </Button>
                        </Link>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-10 space-y-10">
                        {/* Info Highlight */}
                        <div className="p-6 rounded-[32px] bg-accent/5 border border-accent/20 flex items-center gap-6 group">
                            <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center shrink-0 shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <p className="text-sm font-bold text-foreground leading-relaxed">
                                Fora destes horários, a Raquel irá sinalizar ao lead que o atendimento humano retornará em breve.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {daysOfWeek.map((day, index) => (
                                <div
                                    key={day.id}
                                    className={cn(
                                        "flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 rounded-[32px] border transition-all duration-500",
                                        form.watch(`schedules.${index}.isActive`)
                                            ? "bg-white/[0.03] border-border/50 shadow-sm"
                                            : "bg-muted/5 border-transparent opacity-60"
                                    )}
                                >
                                    <div className="flex items-center gap-6">
                                        <Switch
                                            checked={form.watch(`schedules.${index}.isActive`)}
                                            onCheckedChange={(val) => form.setValue(`schedules.${index}.isActive`, val)}
                                            className="scale-110 data-[state=checked]:bg-accent"
                                        />
                                        <div className="flex flex-col">
                                            <Label className="text-lg font-black text-foreground uppercase tracking-tight">{day.label}</Label>
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{form.watch(`schedules.${index}.isActive`) ? "Ativo" : "Pausado"}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="relative group">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                            <Input
                                                type="time"
                                                {...form.register(`schedules.${index}.startTime`)}
                                                disabled={!form.watch(`schedules.${index}.isActive`)}
                                                className="h-14 w-32 pl-12 bg-muted/20 border-border/30 rounded-2xl font-bold text-base focus-visible:ring-accent/20 transition-all text-center"
                                            />
                                        </div>
                                        <span className="text-muted-foreground font-black text-xs uppercase tracking-widest">até</span>
                                        <div className="relative group">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                            <Input
                                                type="time"
                                                {...form.register(`schedules.${index}.endTime`)}
                                                disabled={!form.watch(`schedules.${index}.isActive`)}
                                                className="h-14 w-32 pl-12 bg-muted/20 border-border/30 rounded-2xl font-bold text-base focus-visible:ring-accent/20 transition-all text-center"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Force */}
                        <div className="flex items-center gap-4 pt-10 border-t border-border/50">
                            <Link href="/configuracoes" className="flex-1">
                                <Button type="button" variant="outline" className="w-full h-16 rounded-[24px] border-border/50 font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-muted btn-interactive">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="flex-[2] h-16 rounded-[24px] bg-primary hover:bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl shadow-black/20 hover:shadow-accent/20 btn-interactive"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-3" />
                                        Salvar Expediente
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
