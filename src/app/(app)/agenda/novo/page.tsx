"use client";

import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Save, Calendar, Clock, Sparkles, CheckCircle2, AlertCircle, User, Home, Rocket } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { createAppointment } from "@/lib/actions/appointments";
import { getLeads } from "@/lib/actions/leads";
import { getProperties } from "@/lib/actions/properties";
import { getLaunches } from "@/lib/actions/launches";

const appointmentSchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    appointmentDate: z.string().min(1, "Informe a data do agendamento"),
    appointmentTime: z.string().optional(),
    leadId: z.string().optional(),
    propertyId: z.string().optional(),
    launchId: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["scheduled", "completed", "cancelled"]),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function NewAppointmentPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [leads, setLeads] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [launches, setLaunches] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const form = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            title: "",
            appointmentDate: new Date().toLocaleDateString('en-CA'),
            appointmentTime: "",
            leadId: "",
            propertyId: "",
            launchId: "",
            notes: "",
            status: "scheduled",
        },
    });

    useEffect(() => {
        async function loadData() {
            try {
                const [l, p, ln] = await Promise.all([
                    getLeads(),
                    getProperties(),
                    getLaunches()
                ]);
                setLeads(l);
                setProperties(p);
                setLaunches(ln);
            } catch (error) {
                console.error("Error loading selection data:", error);
                toast.error("Erro ao carregar dados de seleção.");
            } finally {
                setIsLoadingData(false);
            }
        }
        loadData();
    }, []);

    async function onSubmit(data: AppointmentFormValues) {
        setIsSaving(true);
        try {
            // Convert empty strings back to undefined for the action
            const submitData = {
                ...data,
                leadId: data.leadId || undefined,
                propertyId: data.propertyId || undefined,
                launchId: data.launchId || undefined,
            };

            const result = await createAppointment(submitData as any);
            if (result.error) {
                toast.error(result.error, { duration: 3000 });
                return;
            }
            toast.success("Compromisso agendado com sucesso! ⏰", { duration: 3000 });
            router.push("/agenda");
        } catch (error) {
            console.error(error);
            toast.error("Erro inesperado ao agendar compromisso.", { duration: 3000 });
        } finally {
            setIsSaving(false);
        }
    }

    const statuses = [
        { id: "scheduled", label: "Agendado", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
        { id: "completed", label: "Concluído", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { id: "cancelled", label: "Cancelado", icon: AlertCircle, color: "text-hot", bg: "bg-hot/10" },
    ];

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
            <div className="max-w-3xl mx-auto">
                <div className="bg-card border border-border rounded-[40px] shadow-2xl overflow-hidden relative">
                    {/* Modal Header */}
                    <div className="px-10 py-8 border-b border-border flex items-center justify-between bg-bg/20">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Novo Agendamento</h1>
                            <p className="text-sm text-muted-foreground mt-1">Agende visitas, reuniões ou ligações.</p>
                        </div>
                        <Link href="/agenda">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted transition-colors">
                                <X className="h-6 w-6 text-muted-foreground" />
                            </Button>
                        </Link>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-10 space-y-10">
                            {/* Título */}
                            <FormField
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-sm font-bold text-foreground">O que será agendado?</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Visita: Concept High Line" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-bold text-lg focus-visible:ring-primary/20 transition-all" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Vínculos (Lead, Imóvel, Lançamento) */}
                            <div className="space-y-6 pt-6 border-t border-border">
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-70">Vincular a (Opcional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        name="leadId"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <User className="w-3 h-3 text-primary" /> Lead
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-muted/10 border-border/50 h-12 rounded-xl px-4 font-bold text-xs ring-0 focus:ring-1 focus:ring-primary/20">
                                                            <SelectValue placeholder="Selecione o Lead" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-card border-border">
                                                        <SelectItem value="none">Nenhum</SelectItem>
                                                        {leads.map(lead => (
                                                            <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="propertyId"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Home className="w-3 h-3 text-success" /> Imóvel
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-muted/10 border-border/50 h-12 rounded-xl px-4 font-bold text-xs ring-0 focus:ring-1 focus:ring-primary/20">
                                                            <SelectValue placeholder="Selecione o Imóvel" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-card border-border">
                                                        <SelectItem value="none">Nenhum</SelectItem>
                                                        {properties.map(p => (
                                                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="launchId"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Rocket className="w-3 h-3 text-accent" /> Lançamento
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-muted/10 border-border/50 h-12 rounded-xl px-4 font-bold text-xs ring-0 focus:ring-1 focus:ring-primary/20">
                                                            <SelectValue placeholder="Selecione o Lançamento" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-card border-border">
                                                        <SelectItem value="none">Nenhum</SelectItem>
                                                        {launches.map(l => (
                                                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Data e Hora */}
                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
                                <FormField
                                    name="appointmentDate"
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
                                    name="appointmentTime"
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

                            {/* Status */}
                            <FormField
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="space-y-4 pt-6 border-t border-border">
                                        <FormLabel className="text-sm font-bold text-foreground uppercase tracking-widest opacity-70">Status</FormLabel>
                                        <div className="grid grid-cols-3 gap-4">
                                            {statuses.map((stat) => (
                                                <button
                                                    key={stat.id}
                                                    type="button"
                                                    onClick={() => field.onChange(stat.id)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-6 rounded-[24px] border-2 transition-all duration-300 group",
                                                        field.value === stat.id
                                                            ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
                                                            : "bg-muted/10 border-transparent hover:border-border hover:bg-muted/20"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                                                        field.value === stat.id ? cn(stat.bg, stat.color, "scale-110") : "bg-muted/30 text-muted-foreground group-hover:scale-105"
                                                    )}>
                                                        <stat.icon className="w-6 h-6" />
                                                    </div>
                                                    <span className={cn("text-sm font-bold", field.value === stat.id ? "text-primary" : "text-foreground")}>{stat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Observações / Notas */}
                            <FormField
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="space-y-3 pt-6 border-t border-border">
                                        <FormLabel className="text-sm font-bold text-foreground">Observações / Notas</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Adicione detalhes importantes sobre o agendamento..."
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
                                <Link href="/agenda" className="flex-1">
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
                                        "Agendar Compromisso"
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
