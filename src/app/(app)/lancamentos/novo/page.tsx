"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Building2, MapPin, DollarSign, Plus, Trash2, Layout } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
            units: [{ name: "", areaSqm: "", bedrooms: "", parkingSpots: "", price: "" }],
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
            alert("Erro ao criar lançamento. Verifique os campos.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
            <div className="flex items-center gap-4 border-b border-surface-2 pb-6">
                <Link href="/lancamentos">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-2 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-text">Novo Lançamento</h1>
                    <p className="text-text-muted text-sm italic opacity-80 underline underline-offset-4 decoration-primary/30 decoration-2">Cadastre um novo empreendimento e suas plantas.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Informações do Empreendimento */}
                        <Card className="bg-surface border-surface-2 shadow-xl shadow-black/20 overflow-hidden h-fit">
                            <CardHeader className="bg-bg/20 border-b border-surface-2">
                                <CardTitle className="flex items-center gap-2 text-xl font-display">
                                    <Building2 className="h-6 w-6 text-primary" /> Dados do Empreendimento
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-6">
                                <FormField
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Empreendimento</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Reserva Imperial" {...field} className="bg-surface-2 border-transparent focus:border-primary/50 transition-all h-11" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        name="developer"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Incorporadora</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Gafisa" {...field} className="bg-surface-2 border-transparent" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-surface-2 border-transparent">
                                                            <SelectValue placeholder="Selecione o status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-surface border-surface-2">
                                                        <SelectItem value="pre_launch">Pré-lançamento</SelectItem>
                                                        <SelectItem value="launch">Lançamento</SelectItem>
                                                        <SelectItem value="under_construction">Em obras</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 font-semibold">
                                                    <MapPin className="h-4 w-4 text-secondary" /> Cidade
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: São Paulo" {...field} className="bg-surface-2 border-transparent" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="neighborhood"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 font-semibold">
                                                    <MapPin className="h-4 w-4 text-emerald-400" /> Bairro
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Pinheiros" {...field} className="bg-surface-2 border-transparent" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        name="priceFrom"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 font-semibold font-display italic">
                                                    <DollarSign className="h-4 w-4 text-emerald-500" /> Preço Inicial
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: 450000" {...field} className="bg-surface-2 border-transparent" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="deliveryDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 font-semibold font-display italic">
                                                    Data de Entrega
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} className="bg-surface-2 border-transparent" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição (para treinamento da Raquel)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Fale tudo que a Raquel precisa saber para convencer o cliente sobre este empreendimento..."
                                                    className="min-h-[150px] bg-surface-2 border-transparent focus:border-primary/50"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="targetAudience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Público-Alvo</FormLabel>
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {["Investidores", "Primeiro Imóvel", "Família", "Alto Padrão", "Aposentados"].map((audience) => (
                                                    <Button
                                                        key={audience}
                                                        type="button"
                                                        variant={field.value?.includes(audience) ? "default" : "outline"}
                                                        className={`h-8 rounded-full text-xs ${field.value?.includes(audience) ? "bg-primary text-white" : "border-surface-2 bg-surface-2/50 text-text-muted hover:bg-surface-2"}`}
                                                        onClick={() => {
                                                            const current = field.value || [];
                                                            if (current.includes(audience)) {
                                                                field.onChange(current.filter((a: string) => a !== audience));
                                                            } else {
                                                                field.onChange([...current, audience]);
                                                            }
                                                        }}
                                                    >
                                                        {audience}
                                                    </Button>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator className="bg-surface-2" />

                                <FormField
                                    name="photos"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-display flex items-center gap-2">
                                                <Layout className="h-5 w-5 text-primary" /> Fotos do Empreendimento
                                            </FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Plantas (Units) */}
                        <div className="space-y-6">
                            <Card className="bg-surface border-surface-2 shadow-xl shadow-black/20">
                                <CardHeader className="bg-bg/20 border-b border-surface-2 flex flex-row items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2 text-xl font-display">
                                            <Layout className="h-6 w-6 text-accent" /> Plantas Disponíveis
                                        </CardTitle>
                                        <CardDescription>Cadastre as variações de metragem e quartos.</CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => append({ name: "", areaSqm: "", bedrooms: "", parkingSpots: "", price: "" })}
                                        className="h-8 hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                                    >
                                        <Plus className="h-4 w-4 mr-1" /> Add Planta
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-4 rounded-2xl bg-bg/30 border border-surface-2 space-y-4 relative group animate-in zoom-in-95 duration-200 shadow-sm border-l-4 border-l-primary/30">
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-danger text-white hover:bg-danger-dark opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-95"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                            <FormField
                                                name={`units.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Nome da Planta</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex: Studio 28m²" {...field} className="bg-surface-2 border-transparent h-9 text-sm" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-3 gap-3">
                                                <FormField
                                                    name={`units.${index}.areaSqm`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] uppercase font-bold text-text-muted">Área (m²)</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} className="bg-surface-2 border-transparent h-8 text-center" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    name={`units.${index}.bedrooms`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] uppercase font-bold text-text-muted">Quartos</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} className="bg-surface-2 border-transparent h-8 text-center" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    name={`units.${index}.parkingSpots`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] uppercase font-bold text-text-muted">Vagas</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} className="bg-surface-2 border-transparent h-8 text-center" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-surface-2 sticky bottom-0 bg-bg/80 backdrop-blur-md pb-6">
                        <Link href="/lancamentos">
                            <Button type="button" variant="ghost" className="h-12 px-8 font-semibold">Cancelar</Button>
                        </Link>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-dark text-white px-12 h-12 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1 active:translate-y-0"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-5 w-5" /> Salvar Lançamento
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
