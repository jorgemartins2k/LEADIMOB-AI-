"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveWorkSchedules } from "@/lib/actions/schedule";
import { Loader2 } from "lucide-react";

const daysOfWeek = [
    { id: 1, label: "Segunda-feira" },
    { id: 2, label: "Terça-feira" },
    { id: 3, label: "Quarta-feira" },
    { id: 4, label: "Quinta-feira" },
    { id: 5, label: "Sexta-feira" },
    { id: 6, label: "Sábado" },
    { id: 0, label: "Domingo" },
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
            alert("Configurações salvas com sucesso!");
        } catch (error) {
            console.error("Error saving schedule:", error);
            alert("Erro ao salvar o expediente. Certifique-se de configurar as chaves do Supabase no .env.local.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-display font-bold text-text">Expediente da Raquel</h1>
                <p className="text-text-muted">Defina em quais horários a IA deve responder seus leads automaticamente.</p>
            </div>

            <Card className="bg-surface border-surface-2">
                <CardHeader>
                    <CardTitle className="font-display text-xl text-text">Configuração Semanal</CardTitle>
                    <CardDescription>
                        A Raquel só iniciará atendimentos dentro destes intervalos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            {daysOfWeek.map((day, index) => (
                                <div
                                    key={day.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-bg/30 border border-surface-2 hover:border-surface-2/60 transition-colors"
                                >
                                    <div className="flex items-center gap-4 min-w-[140px]">
                                        <Switch
                                            checked={form.watch(`schedules.${index}.isActive`)}
                                            onCheckedChange={(val) => form.setValue(`schedules.${index}.isActive`, val)}
                                        />
                                        <Label className="font-semibold text-text">{day.label}</Label>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                type="time"
                                                {...form.register(`schedules.${index}.startTime`)}
                                                disabled={!form.watch(`schedules.${index}.isActive`)}
                                                className="h-9 w-24 bg-surface-2 border-transparent focus:border-primary transition-all text-text"
                                            />
                                        </div>
                                        <span className="text-text-muted text-sm px-2">até</span>
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                type="time"
                                                {...form.register(`schedules.${index}.endTime`)}
                                                disabled={!form.watch(`schedules.${index}.isActive`)}
                                                className="h-9 w-24 bg-surface-2 border-transparent focus:border-primary transition-all text-text"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-primary hover:bg-primary-dark text-white px-8 h-11"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    "Salvar Expediente"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
