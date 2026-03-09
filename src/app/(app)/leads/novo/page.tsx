"use client";

import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    X,
    Loader2,
    User,
    Phone,
    Sparkles,
    ArrowRight,
    Lock,
    Clock,
    CalendarCheck,
    TrendingUp
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
import { createLead, checkBusinessStatus, getLeadLimitServerAction } from "@/lib/actions/leads";

const leadSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    phone: z.string().min(10, "Informe um telefone válido (DDD + Número)"),
    source: z.string().optional(),
    temperature: z.enum(["frio", "morno", "quente"]).optional(),
    notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function NewLeadPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<{
        inBusinessHours: boolean;
        remainingLeads: number;
        dailyLimit: number;
        plan: string;
        isLoading: boolean;
    }>({
        inBusinessHours: false,
        remainingLeads: 0,
        dailyLimit: 0,
        plan: "start",
        isLoading: true,
    });

    const form = useForm<LeadFormValues>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            name: "",
            phone: "",
            source: "manual",
            temperature: "frio",
            notes: "",
        },
    });

    useEffect(() => {
        async function loadStatus() {
            try {
                const [inBusiness, limit] = await Promise.all([
                    checkBusinessStatus(),
                    getLeadLimitServerAction()
                ]);

                setStatus({
                    inBusinessHours: inBusiness,
                    remainingLeads: limit.remaining,
                    dailyLimit: limit.dailyLimit,
                    plan: limit.plan,
                    isLoading: false,
                });
            } catch (error) {
                console.error("Erro ao carregar status:", error);
                setStatus(prev => ({ ...prev, isLoading: false }));
            }
        }
        loadStatus();
    }, []);

    async function onSubmit(data: LeadFormValues) {
        if (status.inBusinessHours) {
            toast.error("Horário de expediente ativo. O sistema automatizado da Raquel está em operação.");
            return;
        }
        if (status.remainingLeads <= 0) {
            toast.error("Limite diário de leads atingido.");
            return;
        }

        setIsSaving(true);
        try {
            const result = await createLead(data);
            if (result.error) {
                toast.error(result.error, { duration: 3000 });
                return;
            }
            toast.success("Lead cadastrado e Raquel ativada! 🚀", { duration: 3000 });
            router.push('/leads');
        } catch (err) {
            console.error(err);
            toast.error("Erro inesperado ao salvar lead.", { duration: 3000 });
        } finally {
            setIsSaving(false);
        }
    }

    const isBlocked = !status.isLoading && (status.inBusinessHours || status.remainingLeads <= 0);

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700 pb-20">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Stats Header */}
                {!status.isLoading && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className={cn(
                            "p-6 rounded-[28px] border transition-all flex flex-col gap-2",
                            status.inBusinessHours
                                ? "bg-hot/5 border-hot/20 text-hot"
                                : "bg-success/5 border-success/20 text-success"
                        )}>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status da Raquel</span>
                                {status.inBusinessHours ? <Clock className="w-4 h-4" /> : <CalendarCheck className="w-4 h-4" />}
                            </div>
                            <p className="text-xl font-black uppercase tracking-tight">
                                {status.inBusinessHours ? "Expediente Ativo" : "Pausa p/ Cadastro"}
                            </p>
                            <p className="text-[10px] font-bold opacity-70">
                                {status.inBusinessHours ? "Cadastros manuais bloqueados" : "Disponível para novos leads"}
                            </p>
                        </div>

                        <div className={cn(
                            "p-6 rounded-[28px] border transition-all flex flex-col gap-2",
                            status.remainingLeads > 0
                                ? "bg-primary/5 border-primary/20 text-primary"
                                : "bg-hot/5 border-hot/20 text-hot"
                        )}>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Vagas do Dia</span>
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <p className="text-xl font-black uppercase tracking-tight">
                                {status.remainingLeads} / {status.dailyLimit}
                            </p>
                            <p className="text-[10px] font-bold opacity-70 italic">
                                Plano {
                                    status.plan === 'start' ? 'Iniciante' :
                                        status.plan === 'pro' ? 'Pro' :
                                            status.plan === 'premium' ? 'Enterprise' :
                                                status.plan.toUpperCase()
                                }
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden relative">
                    {/* Blocking Overlay */}
                    {isBlocked && (
                        <div className="absolute inset-0 z-50 bg-card/60 backdrop-blur-[2px] flex items-center justify-center p-10 text-center">
                            <div className="max-w-xs space-y-6 animate-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-hot/10 text-hot rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
                                    <Lock className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Acesso Restrito</h3>
                                    <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                                        {status.inBusinessHours
                                            ? "Durante o expediente da Raquel o sistema automatizado assume o controle. O corretor não pode injetar novos leads para não interromper os fluxos."
                                            : "Você atingiu seu limite de cadastro proporcional ao plano. Novas vagas abrem amanhã pela manhã!"}
                                    </p>
                                </div>
                                <Link href="/leads">
                                    <Button className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase text-[10px] tracking-widest">
                                        Voltar aos Leads
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

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
                                                    disabled={isBlocked}
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
                                                    disabled={isBlocked}
                                                    className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium focus-visible:ring-primary/20 transition-all"
                                                />
                                            </FormControl>
                                            <p className="text-[10px] font-bold text-muted-foreground opacity-40 italic">
                                                *Quarentena de 15 dias aplicada automaticamente.
                                            </p>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isBlocked}>
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
                                                disabled={isBlocked}
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
                                    disabled={isSaving || isBlocked}
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
