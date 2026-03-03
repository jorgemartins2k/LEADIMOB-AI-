"use client";

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
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    type: z.enum(["apartamento", "casa", "terreno", "comercial"]),
    city: z.string().min(2, "Informe a cidade"),
    neighborhood: z.string().optional(),
    address: z.string().optional(),
    state: z.string().optional(),
    price: z.string().min(1, "O preço é obrigatório"),
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    parkingSpots: z.string().optional(),
    standard: z.enum(["economico", "medio", "alto"]),
    targetAudience: z.array(z.string()),
    photos: z.array(z.string()),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export default function NewPropertyPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            title: "",
            type: "casa",
            city: "",
            neighborhood: "",
            address: "",
            state: "SP",
            price: "",
            bedrooms: "",
            bathrooms: "",
            parkingSpots: "",
            standard: "medio",
            targetAudience: [],
            photos: [],
        },
    });

    async function onSubmit(values: PropertyFormValues) {
        setIsSaving(true);
        try {
            await createProperty({
                ...values,
                bedrooms: values.bedrooms ? parseInt(values.bedrooms) : undefined,
                parkingSpots: values.parkingSpots ? parseInt(values.parkingSpots) : undefined,
                photos: values.photos || [],
            });
            router.push("/imoveis");
        } catch (error) {
            console.error(error);
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
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
            <div className="max-w-2xl mx-auto">
                <div className="bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden relative">
                    {/* Modal Header */}
                    <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                        <h1 className="text-xl font-bold text-foreground">Cadastrar Imóvel</h1>
                        <Link href="/imoveis">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted transition-colors">
                                <X className="h-5 w-5 text-muted-foreground" />
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
                                        <FormLabel className="text-sm font-bold text-foreground">Título</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Apartamento 3 quartos - Centro"
                                                {...field}
                                                className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium text-base focus-visible:ring-primary/20 transition-all"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tipo e Preço */}
                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground">Tipo</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium">
                                                        <SelectValue placeholder="Selecione o tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-card border-border">
                                                    <SelectItem value="apartamento">Apartamento</SelectItem>
                                                    <SelectItem value="casa">Casa</SelectItem>
                                                    <SelectItem value="terreno">Terreno</SelectItem>
                                                    <SelectItem value="comercial">Comercial</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground">Preço (R$)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="500000"
                                                    {...field}
                                                    className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium focus-visible:ring-primary/20 transition-all"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Padrão do Imóvel */}
                            <FormField
                                name="standard"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <FormLabel className="text-sm font-bold text-foreground">Padrão do Imóvel</FormLabel>
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
                                                    <span className="text-[10px] text-muted-foreground mt-1 text-center font-medium opacity-60 leading-tight">{std.description}</span>
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
                                    <FormItem className="space-y-6">
                                        <FormLabel className="text-sm font-bold text-foreground">Perfil do Cliente (múltipla escolha)</FormLabel>
                                        <div className="grid grid-cols-2 gap-4">
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
                                                        "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left",
                                                        field.value?.includes(audience)
                                                            ? "bg-primary/5 border-primary"
                                                            : "bg-muted/10 border-transparent hover:border-border hover:bg-muted/20"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                        field.value?.includes(audience) ? "bg-primary border-primary" : "border-muted-foreground/30"
                                                    )}>
                                                        {field.value?.includes(audience) && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                    </div>
                                                    <span className={cn("text-xs font-bold", field.value?.includes(audience) ? "text-primary" : "text-muted-foreground")}>
                                                        {audience}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Endereço */}
                            <div className="space-y-8 pt-6 border-t border-border">
                                <FormField
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground">Endereço Completo</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Rua, número, bairro"
                                                    {...field}
                                                    className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium focus-visible:ring-primary/20 transition-all"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-4 gap-6">
                                    <div className="col-span-3">
                                        <FormField
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-sm font-bold text-foreground">Cidade</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="São Paulo" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium focus-visible:ring-primary/20" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <FormField
                                            name="state"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-sm font-bold text-foreground">Estado</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="SP" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium text-center focus-visible:ring-primary/20" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Specs */}
                            <div className="grid grid-cols-3 gap-6">
                                <FormField
                                    name="bedrooms"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground text-center block">Quartos</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-4 text-center font-bold text-lg" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="bathrooms"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground text-center block">Banheiros</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-4 text-center font-bold text-lg" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="parkingSpots"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground text-center block">Vagas</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-4 text-center font-bold text-lg" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Fotos */}
                            <FormField
                                name="photos"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <FormLabel className="text-sm font-bold text-foreground">Fotos do Imóvel</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col gap-4">
                                                <div className="grid grid-cols-4 gap-4">
                                                    {field.value.map((url, i) => (
                                                        <div key={i} className="aspect-square rounded-2xl border border-border overflow-hidden relative group">
                                                            <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                                                            <button
                                                                onClick={() => field.onChange(field.value.filter((_, idx) => idx !== i))}
                                                                className="absolute top-2 right-2 bg-hot text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        className="aspect-square rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 hover:bg-muted/20 hover:border-primary/30 transition-all group"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                            <Plus className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adicionar</span>
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground font-medium italic opacity-60">
                                                    Clique para adicionar fotos do imóvel
                                                </p>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-10">
                                <Link href="/imoveis" className="flex-1">
                                    <Button type="button" variant="outline" className="w-full h-16 rounded-[24px] border-border/50 font-bold text-muted-foreground hover:bg-muted btn-interactive">
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
                                        "Salvar Imóvel"
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
