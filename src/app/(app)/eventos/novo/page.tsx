"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Calendar, MapPin, Info, Users } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            await createEvent(data);
            router.push("/eventos");
        } catch (error) {
            console.error(error);
            alert("Erro ao criar evento. Verifique os campos.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/eventos">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-2 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-text">Novo Evento</h1>
                    <p className="text-text-muted text-sm italic opacity-80 underline underline-offset-4 decoration-primary/30 decoration-2">Agende workshops, open houses ou coquetéis.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dados do Evento */}
                        <Card className="bg-surface border-surface-2 shadow-xl shadow-black/20">
                            <CardHeader className="border-b border-surface-2 bg-bg/20">
                                <CardTitle className="flex items-center gap-2 text-lg font-display">
                                    <Info className="h-5 w-5 text-primary" /> Detalhes do Evento
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <FormField
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Evento</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Workshop Primeiro Imóvel" {...field} className="bg-surface-2 border-transparent h-11" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        name="eventDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Data</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} className="bg-surface-2 border-transparent" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="eventTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Hora</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} className="bg-surface-2 border-transparent" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    name="standard"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Padrão do Público</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-surface-2 border-transparent">
                                                        <SelectValue placeholder="Selecione o padrão" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-surface border-surface-2">
                                                    <SelectItem value="economico">Econômico</SelectItem>
                                                    <SelectItem value="medio">Médio</SelectItem>
                                                    <SelectItem value="alto">Alto (Luxo)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Local e Descrição */}
                        <div className="space-y-6">
                            <Card className="bg-surface border-surface-2 shadow-xl shadow-black/20">
                                <CardHeader className="border-b border-surface-2 bg-bg/20">
                                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                                        <MapPin className="h-5 w-5 text-secondary" /> Localização
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <FormField
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Endereço ou Link (Online)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Rua Faria Lima, 1234 ou Meet.google.com/..." {...field} className="bg-surface-2 border-transparent" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>O que a Raquel deve dizer sobre o evento?</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Descreva o objetivo do evento para a IA convidar os leads..."
                                                        className="min-h-[145px] bg-surface-2 border-transparent focus:border-primary/50"
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

                    <div className="flex justify-end gap-3 pt-6 border-t border-surface-2">
                        <Link href="/eventos">
                            <Button type="button" variant="ghost" className="h-12 px-8 font-semibold">Cancelar</Button>
                        </Link>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-dark text-white px-10 h-12 shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-5 w-5" /> Salvar Evento
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
