"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Calendar, Clock, User, Building2, Info, BookOpen } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createAppointment } from "@/lib/actions/appointments";

const appointmentSchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    appointmentDate: z.string().min(1, "Informe a data do agendamento"),
    appointmentTime: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["scheduled", "completed", "cancelled"]),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function NewAppointmentPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            title: "",
            appointmentDate: "",
            appointmentTime: "",
            notes: "",
            status: "scheduled",
        },
    });

    async function onSubmit(data: AppointmentFormValues) {
        setIsSaving(true);
        try {
            await createAppointment(data);
            router.push("/agenda");
        } catch (error) {
            console.error(error);
            alert("Erro ao criar agendamento. Verifique os campos.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/agenda">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-2 transition-colors shadow-sm">
                        <ArrowLeft className="h-5 w-5 border-2 border-primary/20 rounded-full p-1" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-text underline decoration-secondary/30 decoration-8 underline-offset-4">Novo Agendamento</h1>
                    <p className="text-text-muted text-sm italic opacity-80 decoration-accent/30 decoration-2 underline-offset-4 underline tracking-tight">Agende visitas, calls ou reuniões presenciais.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Detalhes do Agendamento */}
                        <Card className="bg-surface border-surface-2 shadow-xl shadow-black/20 group hover:border-primary/20 transition-all rounded-[2rem] overflow-hidden">
                            <CardHeader className="border-b border-surface-2 bg-gradient-to-r from-primary/10 to-transparent">
                                <CardTitle className="flex items-center gap-2 text-lg font-display">
                                    <BookOpen className="h-5 w-5 text-primary animate-pulse" /> Detalhes Gerais
                                </CardTitle>
                                <CardDescription className="text-xs text-text-muted">Informe o que será feito e quando.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <FormField
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-text-muted font-bold text-[10px] uppercase tracking-widest pl-1">Título do Agendamento</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Visita: Edifício Aurora" {...field} className="bg-surface-2 border-transparent h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        name="appointmentDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-text-muted font-bold text-[10px] uppercase tracking-widest pl-1">Data</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} className="bg-surface-2 border-transparent rounded-xl h-11" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="appointmentTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-text-muted font-bold text-[10px] uppercase tracking-widest pl-1">Hora</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} className="bg-surface-2 border-transparent rounded-xl h-11" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-text-muted font-bold text-[10px] uppercase tracking-widest pl-1">Status Inicial</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-surface-2 border-transparent rounded-xl h-11">
                                                        <SelectValue placeholder="Selecione o status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-surface border-surface-2">
                                                    <SelectItem value="scheduled">Agendado</SelectItem>
                                                    <SelectItem value="completed">Concluído</SelectItem>
                                                    <SelectItem value="cancelled">Cancelado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Notas e Observações */}
                        <div className="space-y-6">
                            <Card className="bg-surface border-surface-2 shadow-xl shadow-black/20 rounded-[2rem] overflow-hidden flex flex-col h-full">
                                <CardHeader className="border-b border-surface-2 bg-gradient-to-r from-secondary/10 to-transparent">
                                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                                        <Info className="h-5 w-5 text-secondary" /> Observações
                                    </CardTitle>
                                    <CardDescription className="text-xs text-text-muted">Anotações extras para não esquecer nada.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 flex-1">
                                    <FormField
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem className="h-full space-y-2">
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Anote detalhes sobre o lead, o imóvel ou o que for importante para este compromisso..."
                                                        className="h-full min-h-[190px] bg-surface-2 border-transparent focus:border-secondary/50 rounded-2xl resize-none italic text-sm p-4"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-surface-2 sticky bottom-4 bg-bg/50 backdrop-blur-xl p-4 rounded-3xl mt-10">
                        <Link href="/agenda">
                            <Button type="button" variant="ghost" className="h-14 px-10 font-display font-medium text-text-muted hover:text-text transition-all">Cancelar</Button>
                        </Link>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-dark text-white px-12 h-14 rounded-2xl shadow-[0_15px_30px_-10px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 active:scale-95 font-display font-bold text-lg"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-6 w-6" /> Salvar Agendamento
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
