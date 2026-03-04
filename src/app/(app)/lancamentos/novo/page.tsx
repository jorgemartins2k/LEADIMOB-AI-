"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    X,
    Loader2,
    Save,
    Building2,
    MapPin,
    Plus,
    Trash2,
    Layout,
    Calendar,
    Sparkles,
    CheckCircle2,
    Zap,
    Hammer,
    Home
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { createLaunch } from "@/lib/actions/launches";

const launchSchema = z.object({
    name: z.string().min(3, "O nome do lançamento deve ter pelo menos 3 caracteres"),
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
        parkingSpots: z.string().optional(),
        price: z.string().optional(),
        photo: z.string().optional(),
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
            units: [{ name: "", areaSqm: "", bedrooms: "", parkingSpots: "", price: "", photo: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "units",
    });

    async function onSubmit(data: LaunchFormValues) {
        setIsSaving(true);
        try {
            await createLaunch({
                ...data,
                photos: data.photos || [],
                units: data.units.map((u) => ({
                    ...u,
                    bedrooms: u.bedrooms ? parseInt(u.bedrooms) : undefined,
                    parkingSpots: u.parkingSpots ? parseInt(u.parkingSpots) : undefined,
                }))
            });
            router.push("/lancamentos");
        } catch (error) {
            console.error(error);
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
                    <div className="px-10 py-8 border-b border-border flex items-center justify-between bg-bg/20">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Novo Lançamento</h1>
                            <p className="text-sm text-muted-foreground mt-1">Cadastre um novo empreendimento e suas plantas.</p>
                        </div>
                        <Link href="/lancamentos">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted transition-colors">
                                <X className="h-6 w-6 text-muted-foreground" />
                            </Button>
                        </Link>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-10 space-y-12">
                            {/* Dados Básicos */}
                            <div className="space-y-8">
                                <FormField
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground">Nome do Empreendimento</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Reserva Imperial" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-bold text-lg focus-visible:ring-primary/20 transition-all" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <FormField
                                        name="developer"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-bold text-foreground">Incorporadora</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Gafisa" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="deliveryDate"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-primary" /> Data de Entrega
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Status do Lançamento */}
                            <FormField
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <FormLabel className="text-sm font-bold text-foreground uppercase tracking-widest opacity-70">Status Atual</FormLabel>
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

                            {/* Padrão */}
                            <FormField
                                name="standard"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <FormLabel className="text-sm font-bold text-foreground uppercase tracking-widest opacity-70">Padrão Construtivo</FormLabel>
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

                            {/* Localização e Preço */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
                                <div className="md:col-span-2">
                                    <FormField
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-primary" /> Cidade
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="São Paulo" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    name="priceFrom"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground">Preço Inicial</FormLabel>
                                            <FormControl>
                                                <Input placeholder="450000" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Plantas */}
                            <div className="space-y-6 pt-6 border-t border-border">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        <Layout className="h-5 w-5 text-accent" /> Plantas (Unidades)
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ name: "", areaSqm: "", bedrooms: "", parkingSpots: "", price: "" })}
                                        className="rounded-full border-primary/30 text-primary hover:bg-primary/5 h-10 px-6 gap-2"
                                    >
                                        <Plus className="h-4 w-4" /> Add Planta
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-8 rounded-[32px] bg-muted/10 border border-border/50 space-y-6 relative group animate-in slide-in-from-right-4">
                                            {fields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="absolute top-6 right-6 h-10 w-10 rounded-full bg-hot/10 text-hot hover:bg-hot hover:text-white transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            )}

                                            <FormField
                                                name={`units.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nome da Planta / Modelo</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex: Loft Concept - 45m²" {...field} className="bg-white/5 border-border h-12 rounded-xl font-bold" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-3 gap-6">
                                                <FormField
                                                    name={`units.${index}.areaSqm`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black text-muted-foreground uppercase text-center block">M²</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} className="bg-white/5 border-border h-12 rounded-xl text-center font-bold" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    name={`units.${index}.bedrooms`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black text-muted-foreground uppercase text-center block">Quartos</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} className="bg-white/5 border-border h-12 rounded-xl text-center font-bold" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    name={`units.${index}.parkingSpots`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black text-muted-foreground uppercase text-center block">Vagas</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} className="bg-white/5 border-border h-12 rounded-xl text-center font-bold" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Planta Image Upload */}
                                            <FormField
                                                name={`units.${index}.photo`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Planta da Unidade</FormLabel>
                                                        <FormControl>
                                                            <div className="flex flex-col gap-3">
                                                                <ImageUpload
                                                                    value={field.value ? [field.value] : []}
                                                                    onChange={(urls) => field.onChange(urls[0] || "")}
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
                            <div className="flex items-center gap-4 pt-10 border-t border-border">
                                <Link href="/lancamentos" className="flex-1">
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
