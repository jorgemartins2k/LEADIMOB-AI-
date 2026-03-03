"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
    User,
    Phone,
    Building2,
    Save,
    Loader2,
    X,
    Camera,
    ShieldCheck,
    Sparkles,
    Briefcase
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
            // In a real app, use a toast here
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent py-12 animate-fade-up">
            <div className="max-w-3xl mx-auto">
                <div className="card-premium border-none shadow-2xl relative overflow-visible">
                    {/* Modal Header */}
                    <div className="px-10 py-8 border-b border-border/50 flex items-center justify-between bg-white/[0.02]">
                        <div className="space-y-1">
                            <h1 className="heading-xl text-foreground">Meu Perfil</h1>
                            <p className="text-body text-sm font-medium">Gerencie suas informações profissionais.</p>
                        </div>
                        <Link href="/configuracoes">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted btn-interactive">
                                <X className="h-6 w-6 text-muted-foreground" />
                            </Button>
                        </Link>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-10 space-y-10">

                            {/* Profile Header Interior */}
                            <div className="flex items-center gap-10 p-8 rounded-[40px] bg-muted/10 border border-border/30 group">
                                <div className="relative group/avatar">
                                    <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20 transition-all duration-500 group-hover/avatar:scale-105 group-hover/avatar:rotate-3">
                                        <User className="w-12 h-12 text-white" />
                                    </div>
                                    <Button size="icon" className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-foreground text-background shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-[#0F172A]">
                                        <Camera className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-foreground tracking-tighter">Jorge Martins</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/20">Consultor Premium</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Ativo</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <FormField
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                                                <User className="w-3.5 h-3.5" /> Nome Profissional
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input {...field} className="h-16 pl-14 bg-muted/20 border-border/50 rounded-[24px] font-bold text-base focus-visible:ring-accent/20 focus-visible:border-accent transition-all" placeholder="Como você quer ser chamado?" />
                                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="ml-4" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField
                                        name="whatsapp"
                                        render={({ field }) => (
                                            <FormItem className="space-y-4">
                                                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5" /> WhatsApp Business
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Input {...field} className="h-16 pl-14 bg-muted/20 border-border/50 rounded-[24px] font-bold text-base focus-visible:ring-accent/20 focus-visible:border-accent transition-all" placeholder="(11) 99999-9999" />
                                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="ml-4" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        name="realEstateAgency"
                                        render={({ field }) => (
                                            <FormItem className="space-y-4">
                                                <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                                                    <Briefcase className="w-3.5 h-3.5" /> Imobiliária / CRECI
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Input {...field} className="h-16 pl-14 bg-muted/20 border-border/50 rounded-[24px] font-bold text-base focus-visible:ring-accent/20 focus-visible:border-accent transition-all" placeholder="Sua empresa ou registro" />
                                                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="ml-4" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Action Force */}
                            <div className="flex items-center gap-4 pt-10 border-t border-border/50">
                                <Link href="/configuracoes" className="flex-1">
                                    <Button type="button" variant="outline" className="w-full h-16 rounded-[24px] border-border/50 font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-muted btn-interactive">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-[2] h-16 rounded-[24px] bg-primary hover:bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl shadow-black/20 hover:shadow-accent/20 btn-interactive"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-3" />
                                            Atualizar Perfil
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
