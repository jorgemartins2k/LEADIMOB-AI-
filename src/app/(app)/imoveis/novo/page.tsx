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
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
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
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 sm:p-8 md:p-10 space-y-8 md:space-y-10">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            {/* Financiamento e MCMV */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                                <FormField
                                    name="minhaCasaMinhaVida"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-border/50 p-6 bg-muted/10">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm font-bold">Reserva MCMV</FormLabel>
                                                <p className="text-[10px] text-muted-foreground font-medium">Aceita Minha Casa Minha Vida</p>
                                            </div>
                                            <FormControl>
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange(!field.value)}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full transition-all duration-300 relative border border-transparent",
                                                        field.value
                                                            ? "bg-primary shadow-[0_0_15px_-3px_rgba(59,130,246,0.5)]"
                                                            : "bg-zinc-300 dark:bg-zinc-700 border-zinc-400/50 shadow-inner"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.3)]",
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
                                        <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-border/50 p-6 bg-muted/10">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm font-bold">Financiamento</FormLabel>
                                                <p className="text-[10px] text-muted-foreground font-medium">Realizamos financiamento</p>
                                            </div>
                                            <FormControl>
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange(!field.value)}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full transition-all duration-300 relative border border-transparent",
                                                        field.value
                                                            ? "bg-primary shadow-[0_0_15px_-3px_rgba(59,130,246,0.5)]"
                                                            : "bg-zinc-300 dark:bg-zinc-700 border-zinc-400/50 shadow-inner"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.3)]",
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
                                        <FormLabel className="text-sm font-bold text-foreground">Valor de Entrada Opcional (R$)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: 50000"
                                                {...field}
                                                className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium focus-visible:ring-primary/20 transition-all"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Detalhes de Condomínio */}
                            <div className="space-y-6 pt-6 border-t border-border">
                                <FormField
                                    name="isCondo"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-border/50 p-6 bg-muted/10">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm font-bold">É Condomínio?</FormLabel>
                                                <p className="text-[10px] text-muted-foreground font-medium">Marque se o imóvel possui condomínio</p>
                                            </div>
                                            <FormControl>
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange(!field.value)}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full transition-all duration-300 relative border border-transparent",
                                                        field.value
                                                            ? "bg-primary shadow-[0_0_15px_-3px_rgba(59,130,246,0.5)]"
                                                            : "bg-zinc-300 dark:bg-zinc-700 border-zinc-400/50 shadow-inner"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.3)]",
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
                                                <FormLabel className="text-sm font-bold text-foreground">Taxa de Condomínio (R$)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ex: 450"
                                                        {...field}
                                                        className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium focus-visible:ring-primary/20 transition-all"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            {/* Padrão do Imóvel */}
                            <FormField
                                name="standard"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <FormLabel className="text-sm font-bold text-foreground">Padrão do Imóvel</FormLabel>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {standards.map((std) => (
                                                <button
                                                    key={std.id}
                                                    type="button"
                                                    onClick={() => field.onChange(std.id)}
                                                    className={cn(
                                                        "flex sm:flex-col items-center sm:justify-center p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] border-2 transition-all duration-300 group gap-4 sm:gap-0",
                                                        field.value === std.id
                                                            ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
                                                            : "bg-muted/10 border-transparent hover:border-border hover:bg-muted/20"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center sm:mb-4 transition-all duration-300",
                                                        field.value === std.id ? "bg-primary text-white scale-110" : "bg-muted/30 text-muted-foreground group-hover:scale-105"
                                                    )}>
                                                        <std.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                                    </div>
                                                    <div className="flex flex-col sm:items-center">
                                                        <span className={cn("text-xs sm:text-sm font-bold", field.value === std.id ? "text-primary" : "text-foreground")}>{std.label}</span>
                                                        <span className="text-[9px] sm:text-[10px] text-muted-foreground sm:mt-1 sm:text-center font-medium opacity-60 leading-tight">{std.description}</span>
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
                                    <FormItem className="space-y-6">
                                        <FormLabel className="text-sm font-bold text-foreground">Perfil do Cliente (múltipla escolha)</FormLabel>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                        "flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all duration-200 text-left",
                                                        field.value?.includes(audience)
                                                            ? "bg-primary/5 border-primary"
                                                            : "bg-muted/10 border-transparent hover:border-border hover:bg-muted/20"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                                        field.value?.includes(audience) ? "bg-primary border-primary" : "border-muted-foreground/30"
                                                    )}>
                                                        {field.value?.includes(audience) && <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                                                    </div>
                                                    <span className={cn("text-[11px] md:text-xs font-bold", field.value?.includes(audience) ? "text-primary" : "text-muted-foreground")}>
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
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <FormField
                                    name="areaSqm"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] md:text-sm font-bold text-foreground text-center block uppercase tracking-widest">M²</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-muted/20 border-border/50 h-14 rounded-2xl px-4 text-center font-bold text-lg" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="bedrooms"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] md:text-sm font-bold text-foreground text-center block uppercase tracking-widest">Quartos</FormLabel>
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
                                            <FormLabel className="text-[10px] md:text-sm font-bold text-foreground text-center block uppercase tracking-widest">Banh.</FormLabel>
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
                                            <FormLabel className="text-[10px] md:text-sm font-bold text-foreground text-center block uppercase tracking-widest">Vagas</FormLabel>
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
                                                <ImageUpload
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    disabled={isSaving}
                                                />
                                                <p className="text-[10px] text-muted-foreground font-medium italic opacity-60">
                                                    Arraste fotos ou clique para adicionar arquivos da galeria.
                                                </p>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-10">
                                <Link href="/imoveis" className="w-full sm:flex-1">
                                    <Button type="button" variant="outline" className="w-full h-16 rounded-[24px] border-border/50 font-bold text-muted-foreground hover:bg-muted btn-interactive">
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
