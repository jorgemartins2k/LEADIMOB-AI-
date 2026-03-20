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
    Home,
    Building2,
    Sparkles,
    Camera,
    Plus,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/image-upload";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createProperty } from "@/lib/actions/properties";

const propertySchema = z.object({
    title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
    description: z.string().optional(),
    websiteUrl: z.string().optional(),
    type: z.enum(["apartamento", "casa", "terreno", "comercial"]),
    city: z.string().min(2, "Informe a cidade"),
    neighborhood: z.string().optional(),
    address: z.string().optional(),
    state: z.string().optional(),
    price: z.string().min(1, "O preço é obrigatório"),
    areaSqm: z.string().optional(),
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    parkingSpots: z.string().optional(),
    standard: z.enum(["economico", "medio", "alto"]),
    targetAudience: z.array(z.string()),
    photos: z.array(z.string()),
    minhaCasaMinhaVida: z.boolean(),
    allowsFinancing: z.boolean(),
    isCondo: z.boolean(),
    downPayment: z.string().optional(),
    condoFee: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export default function NewPropertyPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            title: "",
            description: "",
            websiteUrl: "",
            type: "casa",
            city: "",
            neighborhood: "",
            address: "",
            state: "SP",
            price: "",
            areaSqm: "",
            bedrooms: "",
            bathrooms: "",
            parkingSpots: "",
            standard: "medio",
            targetAudience: [],
            photos: [],
            minhaCasaMinhaVida: false,
            allowsFinancing: false,
            downPayment: "",
            condoFee: "",
            isCondo: false,
        },
    });

    async function onSubmit(values: PropertyFormValues) {
        setIsSaving(true);
        try {
            const result = await createProperty({
                ...values,
                websiteUrl: values.websiteUrl || undefined,
                bedrooms: values.bedrooms ? parseInt(values.bedrooms) : undefined,
                bathrooms: values.bathrooms ? parseInt(values.bathrooms) : undefined,
                parkingSpots: values.parkingSpots ? parseInt(values.parkingSpots) : undefined,
                photos: values.photos || [],
                minhaCasaMinhaVida: values.minhaCasaMinhaVida,
                allowsFinancing: values.allowsFinancing,
                isCondo: values.isCondo,
                downPayment: values.downPayment || undefined,
                condoFee: values.condoFee || undefined,
            });

            if (result.error) {
                toast.error(result.error, { duration: 3000 });
                return;
            }
            toast.success("Imóvel cadastrado com sucesso! 🏠", { duration: 3000 });
            router.push("/imoveis");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Erro inesperado ao salvar imóvel.", { duration: 3000 });
        } finally {
            setIsSaving(false);
        }
    }

    const standards = [
        { id: "economico", label: "Baixo", description: "Econômico / Popular", icon: Building2 },
        { id: "medio", label: "Médio", description: "Padrão / Conforto", icon: Home },
        { id: "alto", label: "Alto", description: "Luxo / Premium", icon: Sparkles },
    ];

    const audiences = [
        "Investidor", "Primeiro Imóvel",
        "Família", "Aposentado",
        "Jovem Profissional", "Casal sem Filhos"
    ];

    return (
        <div className="min-h-screen bg-muted/30 py-6 sm:py-12 px-2 sm:px-6 lg:px-8 animate-in fade-in duration-700">
            <div className="max-w-2xl mx-auto">
                <div className="bg-card border border-border/50 rounded-[28px] sm:rounded-[32px] shadow-2xl overflow-hidden relative">
                    {/* Modal Header */}
                    <div className="px-5 sm:px-8 py-4 sm:py-6 border-b border-border/50 flex items-center justify-between bg-muted/5">
                        <div className="space-y-0.5">
                            <h1 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight">Novo Imóvel</h1>
                            <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Cadastro de Portfólio</p>
                        </div>
                        <Link href="/imoveis">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted transition-colors h-9 w-9 sm:h-10 sm:w-10">
                                <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            </Button>
                        </Link>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, (errs) => {
                            const msg = Object.keys(errs).join(', ');
                            toast.error(`Preenchimento incorreto nos campos: ${msg}`, { duration: 5000 });
                            console.error("Validation errors:", errs);
                        })} className="p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-10">
                            {/* Título */}
                            <FormField
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2 ml-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                            <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Título do Anúncio</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Apartamento 3 quartos - Centro"
                                                {...field}
                                                className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base focus-visible:ring-accent/20 transition-all placeholder:opacity-30"
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
                                            <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Link no Site do Corretor (Opcional)</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: https://meusite.com.br/imovel"
                                                {...field}
                                                className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base focus-visible:ring-accent/20 transition-all placeholder:opacity-30"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold uppercase" />
                                    </FormItem>
                                )}
                            />

                            {/* Tipo e Preço */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                <FormField
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center gap-2 ml-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Tipo de Imóvel</FormLabel>
                                            </div>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base transition-all">
                                                        <SelectValue placeholder="Selecione o tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-card border-border rounded-2xl">
                                                    <SelectItem value="apartamento" className="font-bold">Apartamento</SelectItem>
                                                    <SelectItem value="casa" className="font-bold">Casa</SelectItem>
                                                    <SelectItem value="terreno" className="font-bold">Terreno</SelectItem>
                                                    <SelectItem value="comercial" className="font-bold">Comercial</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center gap-2 ml-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Preço Estimado (R$)</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: 500000"
                                                    {...field}
                                                    className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base focus-visible:ring-accent/20 transition-all placeholder:opacity-30"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Financiamento e MCMV */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-4">
                                <FormField
                                    name="minhaCasaMinhaVida"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-xl sm:rounded-2xl border border-border/40 p-4 sm:p-6 bg-muted/5 group hover:bg-muted/10 transition-colors">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-[11px] sm:text-sm font-black uppercase tracking-tight">Reserva MCMV</FormLabel>
                                                <p className="text-[8px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Imóvel Minha Casa Minha Vida</p>
                                            </div>
                                            <FormControl>
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange(!field.value)}
                                                    className={cn(
                                                        "w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-all duration-300 relative border border-transparent",
                                                        field.value
                                                            ? "bg-accent shadow-[0_0_15px_-3px_rgba(var(--accent),0.5)]"
                                                            : "bg-zinc-300 dark:bg-zinc-700 border-zinc-400/50"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-0.5 sm:top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md",
                                                        field.value ? "right-1" : "left-1"
                                                    )} />
                                                </button>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="allowsFinancing"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-xl sm:rounded-2xl border border-border/40 p-4 sm:p-6 bg-muted/5 group hover:bg-muted/10 transition-colors">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-[11px] sm:text-sm font-black uppercase tracking-tight">Financiamento</FormLabel>
                                                <p className="text-[8px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Aceita Financiamento Bancário</p>
                                            </div>
                                            <FormControl>
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange(!field.value)}
                                                    className={cn(
                                                        "w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-all duration-300 relative border border-transparent",
                                                        field.value
                                                            ? "bg-accent shadow-[0_0_15px_-3px_rgba(var(--accent),0.5)]"
                                                            : "bg-zinc-300 dark:bg-zinc-700 border-zinc-400/50"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-0.5 sm:top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md",
                                                        field.value ? "right-1" : "left-1"
                                                    )} />
                                                </button>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Valor de Entrada */}
                            <FormField
                                name="downPayment"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center gap-2 ml-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                            <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Valor de Entrada Opcional (R$)</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: 50000"
                                                {...field}
                                                className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base focus-visible:ring-accent/20 transition-all placeholder:opacity-30"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold uppercase" />
                                    </FormItem>
                                )}
                            />

                            {/* Detalhes de Condomínio */}
                            <div className="space-y-5 sm:space-y-6 pt-2 sm:pt-4">
                                <FormField
                                    name="isCondo"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-xl sm:rounded-2xl border border-border/40 p-4 sm:p-6 bg-muted/5 group hover:bg-muted/10 transition-colors">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-[11px] sm:text-sm font-black uppercase tracking-tight">Imóvel em Condomínio?</FormLabel>
                                                <p className="text-[8px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Marque se possui taxa mensal</p>
                                            </div>
                                            <FormControl>
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange(!field.value)}
                                                    className={cn(
                                                        "w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-all duration-300 relative border border-transparent",
                                                        field.value
                                                            ? "bg-accent shadow-[0_0_15px_-3px_rgba(var(--accent),0.5)]"
                                                            : "bg-zinc-300 dark:bg-zinc-700 border-zinc-400/50"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-0.5 sm:top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md",
                                                        field.value ? "right-1" : "left-1"
                                                    )} />
                                                </button>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {form.watch("isCondo") && (
                                    <FormField
                                        name="condoFee"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center gap-2 ml-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                    <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Taxa de Condomínio (R$)</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ex: 450"
                                                        {...field}
                                                        className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base focus-visible:ring-accent/20 transition-all placeholder:opacity-30"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold uppercase" />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            {/* Padrão do Imóvel */}
                            <FormField
                                name="standard"
                                render={({ field }) => (
                                    <FormItem className="space-y-5">
                                        <div className="flex items-center gap-2 ml-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                            <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Padrão Construtivo</FormLabel>
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
                                                    <div className="flex flex-col sm:items-center text-left sm:text-center">
                                                        <span className={cn("text-xs sm:text-sm font-black uppercase tracking-tight", field.value === std.id ? "text-accent" : "text-foreground")}>{std.label}</span>
                                                        <span className="text-[8px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 leading-tight">{std.description}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Perfil do Cliente */}
                            <FormField
                                name="targetAudience"
                                render={({ field }) => (
                                    <FormItem className="space-y-5">
                                        <div className="flex items-center gap-2 ml-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                            <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Perfil do Cliente Ideal</FormLabel>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {audiences.map((audience) => (
                                                <button
                                                    key={audience}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = field.value || [];
                                                        if (current.includes(audience)) {
                                                            field.onChange(current.filter((a: string) => a !== audience));
                                                        } else {
                                                            field.onChange([...current, audience]);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left",
                                                        field.value?.includes(audience)
                                                            ? "bg-accent/5 border-accent shadow-sm"
                                                            : "bg-muted/5 border-transparent hover:border-border/40 hover:bg-muted/10"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                                        field.value?.includes(audience) ? "bg-accent border-accent scale-110" : "border-muted-foreground/30"
                                                    )}>
                                                        {field.value?.includes(audience) && <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                                                    </div>
                                                    <span className={cn("text-[11px] sm:text-xs font-black uppercase tracking-tight", field.value?.includes(audience) ? "text-accent" : "text-muted-foreground opacity-70")}>
                                                        {audience}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Endereço */}
                            <div className="space-y-6 pt-2 sm:pt-4">
                                <FormField
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center gap-2 ml-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Endereço Completo</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Rua, número, bairro"
                                                    {...field}
                                                    className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base focus-visible:ring-accent/20 transition-all placeholder:opacity-30"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold uppercase" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 sm:gap-6">
                                    <div className="sm:col-span-3">
                                        <FormField
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <div className="flex items-center gap-2 ml-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                        <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Cidade</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Input placeholder="São Paulo" {...field} className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base focus-visible:ring-accent/20" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold uppercase" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <FormField
                                            name="state"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <div className="flex items-center gap-2 ml-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                        <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Estado</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Input placeholder="SP" {...field} className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 sm:px-6 font-bold text-sm sm:text-base text-center focus-visible:ring-accent/20 uppercase" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-bold uppercase" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Specs */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-2">
                                <FormField
                                    name="areaSqm"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center block opacity-60">M² Área</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 text-center font-black text-base sm:text-lg focus-visible:ring-accent/20 transition-all" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="bedrooms"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center block opacity-60">Dorms</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 text-center font-black text-base sm:text-lg focus-visible:ring-accent/20 transition-all" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="bathrooms"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center block opacity-60">Suítes</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 text-center font-black text-base sm:text-lg focus-visible:ring-accent/20 transition-all" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="parkingSpots"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center block opacity-60">Vagas</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-muted/10 border-border/40 h-12 sm:h-14 rounded-xl sm:rounded-2xl px-4 text-center font-black text-base sm:text-lg focus-visible:ring-accent/20 transition-all" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Fotos */}
                            <FormField
                                name="photos"
                                render={({ field }) => (
                                    <FormItem className="space-y-4 pt-4 sm:pt-6">
                                        <div className="flex items-center gap-2 ml-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                            <FormLabel className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-foreground opacity-70">Galeria de Fotos</FormLabel>
                                        </div>
                                        <FormControl>
                                            <div className="flex flex-col gap-4">
                                                <div className="p-2 sm:p-4 rounded-[24px] sm:rounded-[32px] border-2 border-dashed border-border/40 bg-muted/5 group hover:border-accent/30 transition-all">
                                                    <ImageUpload
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <p className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50 px-2 leading-relaxed">
                                                    Arraste imagens ou <span className="text-accent underline">selecione arquivos</span> da galeria. Recomendado: 1920x1080px.
                                                </p>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold uppercase" />
                                    </FormItem>
                                )}
                            />

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-6 sm:pt-10">
                                <Link href="/imoveis" className="w-full sm:flex-1 order-2 sm:order-1">
                                    <Button type="button" variant="outline" className="w-full h-14 sm:h-16 rounded-xl sm:rounded-[24px] border-border/40 font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:bg-muted btn-interactive transition-all">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="w-full sm:flex-[2] h-14 sm:h-16 rounded-xl sm:rounded-[24px] bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-accent/20 active:scale-95 disabled:opacity-50 order-1 sm:order-2"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Finalizar Cadastro
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
