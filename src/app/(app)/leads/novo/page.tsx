"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, User, Phone, Info, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";

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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createLead } from "@/lib/actions/leads";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const leadSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    phone: z.string().min(10, "Informe um telefone válido (DDD + Número)"),
    source: z.string().optional(),
    notes: z.string().optional(),
});

export default function NewLeadPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof leadSchema>>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            source: "manual",
        },
    });

    async function onSubmit(data: z.infer<typeof leadSchema>) {
        setIsSaving(true);
        setError(null);
        try {
            await createLead(data);
            router.push("/leads");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erro ao adicionar lead. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
            <div className="flex items-center gap-4 border-b border-surface-2 pb-6">
                <Link href="/leads">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-2 transition-colors border-2 border-primary/20 p-1">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-text">Novo Lead Manual</h1>
                    <p className="text-text-muted text-sm italic font-medium tracking-tight">A Raquel iniciará o atendimento assim que você salvar.</p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="bg-danger/10 border-danger/20 text-danger rounded-3xl animate-in zoom-in-95">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle className="font-display font-bold">Atenção (Quarentena)</AlertTitle>
                    <AlertDescription className="text-xs font-medium">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card className="bg-surface border-surface-2 shadow-2xl shadow-black/30 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-primary/10 via-bg to-bg border-b border-surface-2 pt-10 pb-8 px-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-primary/20 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-display font-black text-text uppercase tracking-tight">Cadastro de Lead</CardTitle>
                                    <CardDescription className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">Identificação e Contato</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-10 px-10 space-y-8 pb-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2 pl-1">
                                                <User className="h-3.5 w-3.5 text-primary" /> Nome Completo
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: João da Silva" {...field} className="bg-bg/50 border-surface-2 focus:border-primary h-14 rounded-2xl text-lg font-medium transition-all" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2 pl-1">
                                                <Phone className="h-3.5 w-3.5 text-secondary" /> Telefone (WhatsApp)
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: 11988887777" {...field} className="bg-bg/50 border-surface-2 focus:border-secondary h-14 rounded-2xl text-lg font-medium transition-all" />
                                            </FormControl>
                                            <FormDescription className="text-[10px] italic opacity-60 pl-1 font-medium">A Raquel enviará o primeiro contato para este número.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                name="source"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">Origem do Lead</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Indicação, Portal, Manual..." {...field} className="bg-bg/50 border-surface-2 h-12 rounded-xl text-sm font-semibold transition-all" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">Notas iniciais</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Alguma observação importante antes da Raquel começar o atendimento?"
                                                className="min-h-[120px] bg-bg/50 border-surface-2 rounded-2xl p-4 text-sm font-medium italic focus:border-accent transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 pt-4 sticky bottom-4">
                        <Link href="/leads">
                            <Button type="button" variant="ghost" className="h-14 px-10 font-display font-medium text-text-muted hover:text-text transition-all bg-bg/20 backdrop-blur-md rounded-2xl">Cancelar</Button>
                        </Link>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-dark text-white px-14 h-14 rounded-2xl shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1 active:scale-95 font-display font-black text-xl uppercase tracking-wider"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-6 w-6" /> Ativar Raquel
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
