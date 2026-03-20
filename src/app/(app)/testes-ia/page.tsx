"use client";

import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    User,
    Phone,
    Sparkles,
    ArrowRight,
    FlaskConical
} from "lucide-react";
import Link from "next/link";

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

import { createImmediateTestLead } from "./actions";

const testSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    phone: z.string().min(10, "Informe um telefone válido (DDD + Número)"),
    notes: z.string().optional(),
});

type TestFormValues = z.infer<typeof testSchema>;

export default function TestAIPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<TestFormValues>({
        resolver: zodResolver(testSchema),
        defaultValues: {
            name: "",
            phone: "",
            notes: "Testando envio imediato da Raquel.",
        },
    });

    async function onSubmit(data: TestFormValues) {
        setIsSaving(true);
        toast.info("Enviando lead mascarado e chamando IA...", { duration: 2000 });

        try {
            const result = await createImmediateTestLead(data);
            if (result.error) {
                toast.error(result.error, { duration: 5000 });
                return;
            }
            toast.success("💥 CHOQUE IA ENVIADO! Verifique o WhatsApp.", { duration: 5000 });

            // Clean the form so they can test again immediately
            form.reset();
        } catch (err) {
            console.error(err);
            toast.error("Erro inesperado no laboratório de testes.", { duration: 3000 });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700 pb-20">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Headers */}
                <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-[28px] flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 text-purple-600 rounded-full">
                        <FlaskConical className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Laboratório de Teste IA</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Este ambiente <b>ignora o expediente</b>, a quarentena e os limites diários.
                            Assim que você clicar em salvar, a Raquel enviará a mensagem na mesma hora para o número inserido.
                        </p>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden relative">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-10 space-y-10">
                            {/* Nome e WhatsApp */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                                                <User className="h-4 w-4 text-purple-500" /> Nome do Lead Fantasia
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Seu Nome Teste"
                                                    {...field}
                                                    className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium focus-visible:ring-purple-500/20 transition-all"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-purple-500" /> Seu WhatsApp
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="11 98888-7777"
                                                    {...field}
                                                    className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium focus-visible:ring-purple-500/20 transition-all"
                                                />
                                            </FormControl>
                                            <p className="text-[10px] font-bold text-muted-foreground opacity-60">
                                                Qualquer DDD e número real (Brasil).
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Notas / Observações */}
                            <FormField
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-purple-500" /> Notas Simulação
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Descreva o foco que a IA deve ter para este teste específico."
                                                {...field}
                                                className="bg-muted/20 border-border/50 min-h-[120px] rounded-2xl p-6 font-medium text-sm focus-visible:ring-purple-500/20 transition-all resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-10 border-t border-border">
                                <Link href="/leads" className="flex-1">
                                    <Button type="button" variant="outline" className="w-full h-16 rounded-[24px] border-border/50 font-bold text-muted-foreground hover:bg-muted btn-interactive">
                                        Voltar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="flex-[2] h-16 rounded-[24px] bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-xl shadow-purple-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <ArrowRight className="w-5 h-5" />
                                            Disparar Choque IA
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
