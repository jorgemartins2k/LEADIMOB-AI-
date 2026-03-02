"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Phone, Building2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateProfile, getProfile } from "@/lib/actions/profile";

const profileSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    whatsapp: z.string().optional(),
    realEstateAgency: z.string().optional(),
});

export default function ProfilePage() {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            whatsapp: "",
            realEstateAgency: "",
        },
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                const profile = await getProfile();
                if (profile) {
                    form.reset({
                        name: profile.name,
                        whatsapp: profile.whatsapp || "",
                        realEstateAgency: profile.realEstateAgency || "",
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProfile();
    }, [form]);

    async function onSubmit(data: z.infer<typeof profileSchema>) {
        setIsSaving(true);
        try {
            await updateProfile(data);
            alert("Perfil atualizado com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar perfil.");
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-1">
                <h1 className="text-3xl font-display font-bold text-text">Meu Perfil</h1>
                <p className="text-text-muted text-sm italic opacity-80 underline underline-offset-4 decoration-primary/30 decoration-2">Gerencie suas informações profissionais.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card className="bg-surface border-surface-2 shadow-xl shadow-black/20 overflow-hidden">
                        <CardHeader className="bg-bg/20 border-b border-surface-2">
                            <CardTitle className="text-xl font-display">Dados Gerais</CardTitle>
                            <CardDescription>Suas informações básicas de contato.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-primary" /> Nome Completo
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-bg/50 border-surface-2" placeholder="Seu nome" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="whatsapp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-primary" /> WhatsApp
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-bg/50 border-surface-2" placeholder="DDD + Número" />
                                            </FormControl>
                                            <FormDescription className="text-[10px] uppercase tracking-tighter">
                                                Número usado para notificações do sistema.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="realEstateAgency"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-primary" /> Imobiliária / Empresa
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-bg/50 border-surface-2" placeholder="Nome da sua imobiliária" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pb-10">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-widest px-8 h-12 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
