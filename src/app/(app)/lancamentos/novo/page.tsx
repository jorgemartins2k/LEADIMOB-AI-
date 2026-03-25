"use client";

import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    X,
    Loader2,
    MapPin,
    Plus,
    Trash2,
    Layout,
    Calendar,
    Upload,
    Zap,
    Sparkles,
    Hammer,
    Building2,
    Home
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/image-upload";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { createLaunch } from "@/lib/actions/launches";

const launchSchema = z.object({
    name: z.string().min(3, "O nome do lançamento deve ter pelo menos 3 caracteres"),
    websiteUrl: z.string().url("Informe uma URL válida (ex: https://meusite.com.br/lancamento)"),
    developer: z.string().optional(),
    description: z.string().optional(),
    city: z.string().min(2, "Informe a cidade"),
    neighborhood: z.string().optional(),
    priceFrom: z.string().optional(),
    deliveryDate: z.string().optional(),
    standard: z.enum(["economico", "medio", "alto"]),
    targetAudience: z.array(z.string()),
    status: z.enum(["pre_launch", "launch", "under_construction"]),
    photos: z.array(z.string()),
    units: z.array(z.object({
        name: z.string().min(1, "Nome da planta"),
        areaSqm: z.string().optional(),
        bedrooms: z.string().optional(),
        bathrooms: z.string().optional(),
        parkingSpots: z.string().optional(),
        price: z.string().optional(),
        photo: z.string().optional(),
        minhaCasaMinhaVida: z.boolean(),
        allowsFinancing: z.boolean(),
        isCondo: z.boolean(),
        downPayment: z.string().optional(),
        condoFee: z.string().optional(),
        targetAudience: z.array(z.string()).optional(),
    })),
});

type LaunchFormValues = z.infer<typeof launchSchema>;

export default function NewLaunchPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<LaunchFormValues>({
        resolver: zodResolver(launchSchema),
        defaultValues: {
            name: "",
            websiteUrl: "",
            developer: "",
            description: "",
            city: "",
            neighborhood: "",
            priceFrom: "",
            deliveryDate: "",
            standard: "medio",
            targetAudience: [],
            status: "pre_launch",
            photos: [],
            units: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "units",
    });

    async function onSubmit(data: LaunchFormValues) {
        setIsSaving(true);
        try {
            const result = await createLaunch({
                ...data,
                websiteUrl: data.websiteUrl,
                priceFrom: data.priceFrom || undefined,
                photos: data.photos || [],
                units: data.units.map((u) => ({
                    ...u,
                    bedrooms: u.bedrooms ? parseInt(String(u.bedrooms)) : 0,
                    bathrooms: u.bathrooms ? parseInt(String(u.bathrooms)) : 0,
                    parkingSpots: u.parkingSpots ? parseInt(String(u.parkingSpots)) : 0,
                    minhaCasaMinhaVida: !!u.minhaCasaMinhaVida,
                    allowsFinancing: !!u.allowsFinancing,
                    isCondo: !!u.isCondo,
                    downPayment: u.downPayment || undefined,
                    condoFee: u.condoFee || undefined,
                    targetAudience: u.targetAudience || [],
                }))
            });

            if (result.error) {
                toast.error(result.error, { duration: 5000 });
                return;
            }

            toast.success("🚀 Empreendimento cadastrado!", {
                description: "Seu lançamento já está disponível no marketplace.",
                duration: 5000
            });

            router.push("/lancamentos");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Erro inesperado.", { description: "Verifique os dados e tente novamente." });
        } finally {
            setIsSaving(false);
        }
    }

    const statuses = [
        { id: "pre_launch", label: "Pré-Lançamento", icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" },
        { id: "launch", label: "Lançamento", icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { id: "under_construction", label: "Em Obras", icon: Hammer, color: "text-amber-500", bg: "bg-amber-500/10" },
    ];

    const standards = [
        { id: "economico", label: "Econômico", icon: Building2 },
        { id: "medio", label: "Médio", icon: Home },
        { id: "alto", label: "Alto / Luxo", icon: Sparkles },
    ];

    const audiences = ["Investidor", "Primeiro Imóvel", "Família", "Aposentado", "Jovem Profissional"];

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
            <div className="max-w-3xl mx-auto">
                <div className="bg-card border border-border rounded-[40px] shadow-2xl overflow-hidden relative">
                    {/* Modal Header */}
                    <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-border/40 flex items-center justify-between bg-muted/5 backdrop-blur-sm">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">Novo Empreendimento</h1>
                            <p className="text-[10px] sm:text-sm text-muted-foreground mt-1 font-bold uppercase tracking-widest opacity-60">Cadastre o lançamento e suas plantas</p>
                        </div>
                        <Link href="/lancamentos">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted btn-interactive">
                                <X className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                            </Button>
                        </Link>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, (errs) => {
                            const msg = Object.keys(errs).join(', ');
                            toast.error(`Preenchimento incorreto nos campos: ${msg}`, { duration: 5000 });
                            console.error("Validation errors:", errs);
                        })} className="p-5 sm:p-10 space-y-8 sm:space-y-12">
                            {/* Dados Básicos */}
                            <div className="space-y-6 sm:space-y-8">
                                <FormField
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center gap-2 ml-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Nome do Empreendimento</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Reserva Imperial"
                                                    {...field}
                                                    className="bg-muted/10 border-border/40 h-12 sm:h-16 rounded-xl sm:rounded-[24px] px-5 sm:px-8 font-black text-base sm:text-xl focus-visible:ring-accent/20 transition-all placeholder:opacity-30"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />

                                {/* Website URL */}
                                <FormField
                                    name="websiteUrl"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center gap-2 ml-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Link no Site do Corretor <span className="text-destructive">*</span></FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: https://meusite.com.br/lancamento"
                                                    {...field}
                                                    className="bg-muted/10 border-border/40 h-12 sm:h-16 rounded-xl sm:rounded-[24px] px-5 sm:px-8 font-black text-base sm:text-xl focus-visible:ring-accent/20 transition-all placeholder:opacity-30"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
                                    <FormField
                                        name="developer"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <div className="flex items-center gap-2 ml-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                    <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Construtora / Incorporadora</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Input placeholder="Ex: Gafisa, Cyrela..." {...field} className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base focus-visible:ring-accent/20 transition-all placeholder:opacity-30" />
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold uppercase" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="priceFrom"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <div className="flex items-center gap-2 ml-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                    <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-accent">Valor a partir de (R$)</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Input placeholder="Ex: 250000" {...field} className="bg-accent/5 border-accent/20 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-black text-sm sm:text-base text-accent focus-visible:ring-accent/30 transition-all placeholder:text-accent/30" />
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold uppercase" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 pt-2 sm:pt-4">
                                <FormField
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center gap-2 ml-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Cidade</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input placeholder="Ex: São Paulo" {...field} className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base focus-visible:ring-accent/20 transition-all" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="neighborhood"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center gap-2 ml-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Bairro</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input placeholder="Ex: Moema" {...field} className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base focus-visible:ring-accent/20 transition-all" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 pt-2 sm:pt-4">
                                <FormField
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center gap-2 ml-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Status do Empreendimento</FormLabel>
                                            </div>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base focus:ring-accent/20 transition-all">
                                                        <SelectValue placeholder="Selecione o status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-border/40">
                                                    <SelectItem value="pre_launch" className="font-bold text-xs uppercase tracking-widest">Pré-Lançamento</SelectItem>
                                                    <SelectItem value="launch" className="font-bold text-xs uppercase tracking-widest">Em Lançamento</SelectItem>
                                                    <SelectItem value="under_construction" className="font-bold text-xs uppercase tracking-widest">Em Construção</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="deliveryDate"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center gap-2 ml-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Previsão de Entrega</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input type="date" {...field} className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base focus-visible:ring-accent/20 transition-all" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-8 pt-2 sm:pt-4">
                                <FormField
                                    name="standard"
                                    render={({ field }) => (
                                        <FormItem className="space-y-5">
                                            <div className="flex items-center gap-2 ml-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Padrão do Lançamento</FormLabel>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                                {standards.map((std) => (
                                                    <button
                                                        key={std.id}
                                                        type="button"
                                                        onClick={() => field.onChange(std.id)}
                                                        className={cn(
                                                            "flex items-center sm:flex-col sm:justify-center p-3.5 sm:p-6 rounded-xl sm:rounded-[24px] border-2 transition-all duration-300 group gap-4 sm:gap-0",
                                                            field.value === std.id
                                                                ? "bg-accent/5 border-accent shadow-lg shadow-accent/5"
                                                                : "bg-muted/5 border-transparent hover:border-border/40 hover:bg-muted/10"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center sm:mb-4 transition-all duration-300",
                                                            field.value === std.id ? "bg-accent text-white scale-110" : "bg-muted/20 text-muted-foreground group-hover:scale-105"
                                                        )}>
                                                            <std.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                                                        </div>
                                                        <span className={cn("text-xs sm:text-sm font-black uppercase tracking-tight", field.value === std.id ? "text-accent" : "text-foreground")}>{std.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="targetAudience"
                                    render={({ field }) => (
                                        <FormItem className="space-y-5">
                                            <div className="flex items-center gap-2 ml-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Perfil do Cliente Ideal</FormLabel>
                                            </div>
                                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                                {audiences.map((audience) => (
                                                    <button
                                                        key={audience}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = Array.isArray(field.value) ? field.value : [];
                                                            if (current.includes(audience)) {
                                                                field.onChange(current.filter((a: string) => a !== audience));
                                                            } else {
                                                                field.onChange([...current, audience]);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "px-4 sm:px-6 py-2 sm:py-3 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-2",
                                                            field.value?.includes(audience)
                                                                ? "bg-accent border-accent text-white shadow-lg shadow-accent/20 scale-105"
                                                                : "bg-muted/5 border-transparent text-muted-foreground hover:bg-muted/10 hover:border-border/40"
                                                        )}
                                                    >
                                                        {audience}
                                                    </button>
                                                ))}
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Plantas */}
                            <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                        <h3 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight">
                                            Plantas (Unidades)
                                        </h3>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({
                                            name: "",
                                            areaSqm: "",
                                            bedrooms: "",
                                            bathrooms: "",
                                            parkingSpots: "",
                                            price: "",
                                            photo: "",
                                            minhaCasaMinhaVida: false,
                                            allowsFinancing: false,
                                            isCondo: false,
                                            downPayment: "",
                                            condoFee: "",
                                            targetAudience: []
                                        })}
                                        className="h-10 sm:h-12 px-6 sm:px-8 rounded-full border-accent/20 text-accent font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-accent/5 transition-all btn-interactive flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" /> Add Planta
                                    </Button>
                                </div>

                                <div className="space-y-6 sm:space-y-8">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] bg-muted/5 border border-border/40 space-y-6 sm:space-y-8 relative group animate-in slide-in-from-right-4 duration-500">
                                            {fields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="absolute -top-3 -right-3 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all flex items-center justify-center shadow-xl shadow-red-500/20 active:scale-90 z-10"
                                                >
                                                    <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
                                                </button>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
                                                <FormField
                                                    name={`units.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest opacity-70">Nome da Planta / Modelo</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Ex: Loft Concept - 45m²" {...field} className="bg-muted/10 border-border/40 h-10 sm:h-12 rounded-xl sm:rounded-2xl px-4 font-black" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    name={`units.${index}.price`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest opacity-70">Valor da Unidade (R$)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Ex: 450000" {...field} className="bg-accent/5 border-accent/20 h-10 sm:h-12 rounded-xl sm:rounded-2xl px-4 font-black text-accent" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                                <FormField
                                                    name={`units.${index}.areaSqm`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center block opacity-60">M² Área</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} className="bg-muted/10 border-border/40 h-10 sm:h-12 rounded-xl sm:rounded-2xl text-center font-black" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    name={`units.${index}.bedrooms`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center block opacity-60">Dorms</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} className="bg-muted/10 border-border/40 h-10 sm:h-12 rounded-xl sm:rounded-2xl text-center font-black" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    name={`units.${index}.bathrooms`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center block opacity-60">Suítes</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} className="bg-muted/10 border-border/40 h-10 sm:h-12 rounded-xl sm:rounded-2xl text-center font-black" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    name={`units.${index}.parkingSpots`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center block opacity-60">Vagas</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} className="bg-muted/10 border-border/40 h-10 sm:h-12 rounded-xl sm:rounded-2xl text-center font-black" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Perfil do Cliente (Target Audience) for Unit */}
                                            <FormField
                                                name={`units.${index}.targetAudience`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-4">
                                                        <FormLabel className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest opacity-70">Público Alvo da Planta</FormLabel>
                                                        <div className="flex flex-wrap gap-2">
                                                            {audiences.map((audience) => (
                                                                <button
                                                                    key={audience}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const current = Array.isArray(field.value) ? field.value : [];
                                                                        if (current.includes(audience)) {
                                                                            field.onChange(current.filter((a: string) => a !== audience));
                                                                        } else {
                                                                            field.onChange([...current, audience]);
                                                                        }
                                                                    }}
                                                                    className={cn(
                                                                        "px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full text-[9px] sm:text-10px font-black uppercase tracking-widest transition-all border-2",
                                                                        field.value?.includes(audience)
                                                                            ? "bg-accent border-accent text-white"
                                                                            : "bg-muted/5 border-transparent text-muted-foreground hover:border-border/40"
                                                                    )}
                                                                >
                                                                    {audience}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex flex-col lg:flex-row gap-6 py-6 border-y border-border/40">
                                                <div className="w-full lg:w-[35%]">
                                                    <FormField
                                                        name={`units.${index}.photo`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-3">
                                                                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Planta da Unidade</FormLabel>
                                                                <FormControl>
                                                                    <div className="flex flex-col gap-3">
                                                                        <ImageUpload
                                                                            value={field.value ? [field.value] : []}
                                                                            onChange={(urls) => field.onChange(urls[urls.length - 1] || "")}
                                                                            disabled={isSaving}
                                                                        />
                                                                        <p className="text-[10px] text-muted-foreground font-medium italic opacity-60">
                                                                            Adicione a imagem referente a planta (preferência planta baixa da unidade).
                                                                        </p>
                                                                    </div>
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="w-full lg:w-[65%] space-y-4 pt-1">
                                                    {/* Switches line */}
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        <FormField
                                                            name={`units.${index}.minhaCasaMinhaVida`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex items-center justify-between rounded-xl border border-border/30 px-3 py-3.5 bg-white/5 h-[60px]">
                                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider mb-0 cursor-pointer">MCMV</FormLabel>
                                                                    <FormControl>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => field.onChange(!field.value)}
                                                                            className={cn(
                                                                                "w-10 h-5 rounded-full transition-all duration-300 relative border border-transparent shrink-0",
                                                                                field.value
                                                                                    ? "bg-primary shadow-[0_0_10px_-2px_rgba(59,130,246,0.5)]"
                                                                                    : "bg-zinc-300 dark:bg-zinc-700 border-zinc-400/50 shadow-inner"
                                                                            )}
                                                                        >
                                                                            <div className={cn(
                                                                                "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                                                                                field.value ? "right-0.5" : "left-0.5"
                                                                            )} />
                                                                        </button>
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            name={`units.${index}.allowsFinancing`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex items-center justify-between rounded-xl border border-border/30 px-3 py-3.5 bg-white/5 h-[60px]">
                                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider mb-0 cursor-pointer">Financ.</FormLabel>
                                                                    <FormControl>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => field.onChange(!field.value)}
                                                                            className={cn(
                                                                                "w-10 h-5 rounded-full transition-all duration-300 relative border border-transparent shrink-0",
                                                                                field.value
                                                                                    ? "bg-primary shadow-[0_0_10px_-2px_rgba(59,130,246,0.5)]"
                                                                                    : "bg-zinc-300 dark:bg-zinc-700 border-zinc-400/50 shadow-inner"
                                                                            )}
                                                                        >
                                                                            <div className={cn(
                                                                                "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                                                                                field.value ? "right-0.5" : "left-0.5"
                                                                            )} />
                                                                        </button>
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            name={`units.${index}.isCondo`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex items-center justify-between rounded-xl border border-border/30 px-3 py-3.5 bg-white/5 h-[60px]">
                                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0 cursor-pointer">Condom.</FormLabel>
                                                                    <FormControl>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => field.onChange(!field.value)}
                                                                            className={cn(
                                                                                "w-10 h-5 rounded-full transition-all duration-300 relative border border-transparent shrink-0",
                                                                                field.value
                                                                                    ? "bg-primary shadow-[0_0_10px_-2px_rgba(59,130,246,0.5)]"
                                                                                    : "bg-zinc-300 dark:bg-zinc-700 border-zinc-400/50 shadow-inner"
                                                                            )}
                                                                        >
                                                                            <div className={cn(
                                                                                "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300",
                                                                                field.value ? "right-0.5" : "left-0.5"
                                                                            )} />
                                                                        </button>
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                                        <FormField
                                                            name={`units.${index}.downPayment`}
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-2">
                                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entrada (R$)</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="Opcional" {...field} className="bg-white/5 border-border h-11 rounded-lg text-sm" />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        {form.watch(`units.${index}.isCondo`) && (
                                                            <FormField
                                                                name={`units.${index}.condoFee`}
                                                                render={({ field }) => (
                                                                    <FormItem className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                                                        <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Taxa Condomínio (R$)</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="Ex: 350" {...field} className="bg-white/5 border-border h-11 rounded-lg text-sm" />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Descrição e IA */}
                            <FormField
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="space-y-3 pt-6 border-t border-border">
                                        <FormLabel className="text-sm font-bold text-foreground">Notas para Treinamento da Raquel (IA)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Descreva pontos fortes do empreendimento para a IA utilizar nos argumentos de venda..."
                                                {...field}
                                                className="bg-muted/20 border-border/50 min-h-[150px] rounded-2xl p-6 font-medium text-sm resize-none focus-visible:ring-primary/20"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Fotos */}
                            <FormField
                                name="photos"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <FormLabel className="text-sm font-bold text-foreground">Fotos do Empreendimento</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col gap-4">
                                                <ImageUpload
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    disabled={isSaving}
                                                />
                                                <p className="text-[10px] text-muted-foreground font-medium italic opacity-60">
                                                    Adicione fotos gerais do empreendimento (faixada, áreas de lazer e planejados).
                                                </p>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-10 border-t border-border">
                                <Link href="/lancamentos" className="w-full sm:flex-1">
                                    <Button type="button" variant="outline" className="w-full h-16 rounded-[24px] border-border/50 font-bold text-muted-foreground hover:bg-muted">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="w-full sm:flex-[2] h-16 rounded-[24px] bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        "Salvar Empreendimento"
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
