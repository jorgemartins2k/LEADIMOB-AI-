"use client";

import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    X,
    Loader2,
    Save,
    User,
    Phone,
    Sparkles,
    Flame,
    Wind,
    Thermometer,
    ArrowRight
} from "lucide-react";
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
import { createLead } from "@/lib/actions/leads";

const leadSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    phone: z.string().min(10, "Informe um telefone válido (DDD + Número)"),
    source: z.string().optional(),
    temperature: z.enum(["frio", "morno", "quente"]),
    notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function NewLeadPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<LeadFormValues>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            name: "",
            phone: "",
            source: "manual",
            temperature: "morno",
            notes: "",
        },
    });

    async function onSubmit(data: LeadFormValues) {
        setIsSaving(true);
        try {
            const result = await createLead(data);
            if (result.error) {
                toast.error(result.error, { duration: 3000 });
                return;
            }
            toast.success("Lead cadastrado e Raquel ativada! 🚀", { duration: 3000 });
            form.reset();
        } catch (err) {
            console.error(err);
            toast.error("Erro inesperado ao salvar lead.", { duration: 3000 });
        } finally {
            setIsSaving(false);
        }
    }

    const temperatures = [
        { id: "frio", label: "Frio", description: "Primeiro contato", icon: Wind, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "morno", label: "Morno", description: "Interesse inicial", icon: Thermometer, color: "text-orange-500", bg: "bg-orange-500/10" },
        { id: "quente", label: "Quente", description: "Pronto para fechar", icon: Flame, color: "text-red-500", bg: "bg-red-500/10" },
    ];

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
            <div className="max-w-2xl mx-auto">
                <div className="bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden relative">
                    {/* Modal Header */}
                    <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                        <h1 className="text-xl font-bold text-foreground">Cadastrar Lead</h1>
                        <Link href="/leads">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted transition-colors">
                                <X className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </Link>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-10 space-y-10">
                            {/* Nome e WhatsApp */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                                                <User className="h-4 w-4 text-primary" /> Nome do Lead
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="João Silva"
                                                    {...field}
                                                    className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium focus-visible:ring-primary/20 transition-all"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-secondary" /> WhatsApp
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="11 98888-7777"
                                                    {...field}
                                                    className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium focus-visible:ring-primary/20 transition-all"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Origem */}
                            <FormField
                                name="source"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-sm font-bold text-foreground">Origem do Lead</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium">
                                                    <SelectValue placeholder="Selecione a origem" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-card border-border">
                                                <SelectItem value="manual">Cadastro Manual</SelectItem>
                                                <SelectItem value="site">Site Institucional</SelectItem>
                                                <SelectItem value="instagram">Instagram / Facebook</SelectItem>
                                                <SelectItem value="whatsapp">WhatsApp Direto</SelectItem>
                                                <SelectItem value="indicacao">Indicação</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Temperatura / Prioridade */}
                            <FormField
                                name="temperature"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <FormLabel className="text-sm font-bold text-foreground">Temperatura do Lead</FormLabel>
                                        <div className="grid grid-cols-3 gap-4">
                                            {temperatures.map((temp) => (
                                                <button
                                                    key={temp.id}
                                                    type="button"
                                                    onClick={() => field.onChange(temp.id)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-6 rounded-[24px] border-2 transition-all duration-300 group",
                                                        field.value === temp.id
                                                            ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
                                                            : "bg-muted/10 border-transparent hover:border-border hover:bg-muted/20"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                                                        field.value === temp.id ? cn(temp.bg, temp.color, "scale-110") : "bg-muted/30 text-muted-foreground group-hover:scale-105"
                                                    )}>
                                                        <temp.icon className="w-6 h-6" />
                                                    </div>
                                                    <span className={cn("text-sm font-bold", field.value === temp.id ? "text-primary" : "text-foreground")}>{temp.label}</span>
                                                    <span className="text-[10px] text-muted-foreground mt-1 text-center font-medium opacity-60 leading-tight">{temp.description}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Notas / Observações */}
                            <FormField
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-accent" /> Notas para a Raquel (IA)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Descreva o interesse do lead ou observações importantes para a abordagem da IA..."
                                                {...field}
                                                className="bg-muted/20 border-border/50 min-h-[120px] rounded-2xl p-6 font-medium text-sm focus-visible:ring-primary/20 transition-all resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-10 border-t border-border">
                                <Link href="/leads" className="flex-1">
                                    <Button type="button" variant="outline" className="w-full h-16 rounded-[24px] border-border/50 font-bold text-muted-foreground hover:bg-muted btn-interactive">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="flex-[2] h-16 rounded-[24px] bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <ArrowRight className="w-5 h-5" />
                                            Salvar e Ativar Raquel
                                        </>
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
