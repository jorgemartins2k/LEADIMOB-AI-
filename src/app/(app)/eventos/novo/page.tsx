"use client";

import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Save, Calendar, MapPin, Users, Sparkles, Home, Building2, Clock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createEvent } from "@/lib/actions/events";

const eventSchema = z.object({
    name: z.string().min(3, "O nome do evento deve ter pelo menos 3 caracteres"),
    eventDate: z.string().min(1, "Informe a data do evento"),
    eventTime: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    standard: z.enum(["economico", "medio", "alto"]),
    targetAudience: z.array(z.string()),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function NewEventPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            name: "",
            eventDate: "",
            eventTime: "",
            location: "",
            description: "",
            standard: "medio",
            targetAudience: [],
        },
    });

    async function onSubmit(data: EventFormValues) {
        setIsSaving(true);
        try {
            const result = await createEvent(data);
            if (result.error) {
                toast.error(result.error, { duration: 3000 });
                return;
            }
            toast.success("Evento agendado com sucesso! 📅", { duration: 3000 });
            router.push("/eventos");
        } catch (error) {
            console.error(error);
            toast.error("Erro inesperado ao salvar evento.", { duration: 3000 });
        } finally {
            setIsSaving(false);
        }
    }

    const standards = [
        { id: "economico", label: "Econômico", icon: Building2 },
        { id: "medio", label: "Médio", icon: Home },
        { id: "alto", label: "Alto / Luxo", icon: Sparkles },
    ];

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
            <div className="max-w-3xl mx-auto">
                <div className="bg-card border border-border rounded-[40px] shadow-2xl overflow-hidden relative">
                    {/* Modal Header */}
                    <div className="px-10 py-8 border-b border-border flex items-center justify-between bg-bg/20">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Novo Evento</h1>
                            <p className="text-sm text-muted-foreground mt-1">Agende workshops, open houses ou coquetéis.</p>
                        </div>
                        <Link href="/eventos">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted transition-colors">
                                <X className="h-6 w-6 text-muted-foreground" />
                            </Button>
                        </Link>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-10 space-y-12">
                            {/* Dados do Evento */}
                            <div className="space-y-8">
                                <FormField
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground">Nome do Evento</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Workshop Primeiro Imóvel" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-bold text-lg focus-visible:ring-primary/20 transition-all" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <FormField
                                        name="eventDate"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-primary" /> Data
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="eventTime"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-primary" /> Horário
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Padrão */}
                            <FormField
                                name="standard"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <FormLabel className="text-sm font-bold text-foreground uppercase tracking-widest opacity-70">Padrão do Público</FormLabel>
                                        <div className="grid grid-cols-3 gap-4">
                                            {standards.map((std) => (
                                                <button
                                                    key={std.id}
                                                    type="button"
                                                    onClick={() => field.onChange(std.id)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-6 rounded-[24px] border-2 transition-all duration-300 group",
                                                        field.value === std.id
                                                            ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
                                                            : "bg-muted/10 border-transparent hover:border-border hover:bg-muted/20"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                                                        field.value === std.id ? "bg-primary text-white scale-110" : "bg-muted/30 text-muted-foreground group-hover:scale-105"
                                                    )}>
                                                        <std.icon className="w-6 h-6" />
                                                    </div>
                                                    <span className={cn("text-sm font-bold", field.value === std.id ? "text-primary" : "text-foreground")}>{std.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Localização */}
                            <FormField
                                name="location"
                                render={({ field }) => (
                                    <FormItem className="space-y-3 pt-6 border-t border-border">
                                        <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-secondary" /> Localização
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Rua Faria Lima, 1234 ou Meet.google.com/..." {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium focus-visible:ring-primary/20 transition-all" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Descrição / IA */}
                            <FormField
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="space-y-3 pt-6 border-t border-border">
                                        <FormLabel className="text-sm font-bold text-foreground">Notas para Treinamento da Raquel (IA)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Descreva o objetivo do evento para a IA convidar os leads e argumentar sobre a importância da presença..."
                                                {...field}
                                                className="bg-muted/20 border-border/50 min-h-[150px] rounded-2xl p-6 font-medium text-sm resize-none focus-visible:ring-primary/20"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-10 border-t border-border">
                                <Link href="/eventos" className="flex-1">
                                    <Button type="button" variant="outline" className="w-full h-16 rounded-[24px] border-border/50 font-bold text-muted-foreground hover:bg-muted">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="flex-[2] h-16 rounded-[24px] bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        "Agendar Evento"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
