"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Home, Info, MapPin, DollarSign, Users as UsersIcon, Camera } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProperty } from "@/lib/actions/properties";

const propertySchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    description: z.string().optional(),
    type: z.enum(["apartamento", "casa", "terreno", "comercial"]),
    city: z.string().min(2, "Informe a cidade"),
    neighborhood: z.string().optional(),
    address: z.string().optional(),
    price: z.string().min(1, "O preço é obrigatório"),
    areaSqm: z.string().optional(),
    bedrooms: z.string().optional(),
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
            description: "",
            type: "apartamento",
            city: "",
            neighborhood: "",
            address: "",
            price: "",
            areaSqm: "",
            bedrooms: "",
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
            alert("Erro ao criar imóvel. Verifique os campos e tente novamente.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/imoveis">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-2 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-text">Novo Imóvel</h1>
                    <p className="text-text-muted text-sm italic opacity-80 underline underline-offset-4 decoration-primary/30 decoration-2">Cadastre um imóvel no seu portfólio.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Informações Básicas */}
                        <Card className="bg-surface border-surface-2 shadow-xl shadow-black/20">
                            <CardHeader className="border-b border-surface-2 bg-bg/20">
                                <CardTitle className="flex items-center gap-2 text-lg font-display">
                                    <Info className="h-5 w-5 text-primary" /> Informações Básicas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <FormField
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título para a Raquel usar</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Apartamento de luxo no Itaim" {...field} className="bg-surface-2 border-transparent focus:border-primary/50 transition-all" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-surface-2 border-transparent">
                                                            <SelectValue placeholder="Selecione o tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-surface border-surface-2">
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
                                        name="standard"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Padrão</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-surface-2 border-transparent">
                                                            <SelectValue placeholder="Padrão do imóvel" />
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
                                </div>

                                <FormField
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição detalhada (para IA)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Fale tudo que a Raquel precisa saber para convencer o cliente..."
                                                    className="min-h-[120px] bg-surface-2 border-transparent focus:border-primary/50"
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
                            </CardContent>
                        </Card>

                        {/* Localização e Preço */}
                        <div className="space-y-6">
                            <Card className="bg-surface border-surface-2 shadow-xl shadow-black/20">
                                <CardHeader className="border-b border-surface-2 bg-bg/20">
                                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                                        <MapPin className="h-5 w-5 text-secondary" /> Localização
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <FormField
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cidade</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: São Paulo" {...field} className="bg-surface-2 border-transparent focus:border-primary/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            name="neighborhood"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bairro</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Itaim" {...field} className="bg-surface-2 border-transparent focus:border-primary/50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Preço (R$)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="0.00" {...field} className="bg-surface-2 border-transparent focus:border-primary/50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-surface border-surface-2 shadow-xl shadow-black/20">
                                <CardHeader className="border-b border-surface-2 bg-bg/20">
                                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                                        <Home className="h-5 w-5 text-accent" /> Características
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        <FormField
                                            name="areaSqm"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Área (m²)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="80" {...field} className="bg-surface-2 border-transparent text-center" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="bedrooms"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Quartos</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="bg-surface-2 border-transparent text-center" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="parkingSpots"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Vagas</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="bg-surface-2 border-transparent text-center" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-surface border-surface-2 shadow-xl shadow-black/20">
                                <CardHeader className="border-b border-surface-2 bg-bg/20">
                                    <CardTitle className="flex items-center gap-2 text-lg font-display">
                                        <Camera className="h-5 w-5 text-primary" /> Fotos do Imóvel
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <FormField
                                        name="photos"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <ImageUpload
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        disabled={isSaving}
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
                        <Link href="/imoveis">
                            <Button type="button" variant="ghost" className="h-12 px-8">Cancelar</Button>
                        </Link>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-dark text-white px-10 h-12 shadow-lg shadow-primary/20"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-5 w-5" /> Salvar Imóvel
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
