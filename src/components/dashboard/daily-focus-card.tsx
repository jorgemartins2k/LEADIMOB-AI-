'use client';

import { useState, useEffect } from "react";
import { Target, CheckCircle2, Loader2, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getDailyFocus, setDailyFocus } from "@/lib/actions/focus";
import { cn } from "@/lib/utils";

export function DailyFocusCard() {
    const [focus, setFocus] = useState("");
    const [savedFocus, setSavedFocus] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const currentFocus = await getDailyFocus();
                if (currentFocus) {
                    setSavedFocus(currentFocus);
                    setFocus(currentFocus);
                }
            } catch (err) {
                console.error("Failed to load daily focus:", err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    const handleSave = async (textToSave: string) => {
        setIsSaving(true);
        try {
            const result = await setDailyFocus(textToSave);
            if (result.success) {
                setSavedFocus(result.text);
                setFocus(result.text || "");
                if (result.text) {
                    toast.success("🎯 Foco da Raquel atualizado para hoje!");
                } else {
                    toast("Foco diário removido. Atendimento padrão ativado.");
                }
            } else {
                toast.error(result.error || "Erro ao atualizar foco.");
            }
        } catch (error) {
            toast.error("Erro inesperado ao salvar foco.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="card-premium p-6 sm:p-8 flex items-center justify-center min-h-[140px] animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className={cn(
            "card-premium p-6 sm:p-8 relative overflow-hidden transition-colors duration-500",
            savedFocus ? "border-accent/30 bg-accent/5 shadow-xl shadow-accent/5" : ""
        )}>
            {savedFocus && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full -z-10" />
            )}

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                            savedFocus ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-muted/30 text-muted-foreground"
                        )}>
                            <Target className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-widest text-foreground">Foco de Vendas Diário</h3>
                        {savedFocus && (
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                                <Sparkles className="w-3 h-3" /> Ativo
                            </span>
                        )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-md">
                        Digite um <strong>Lançamento ou Imóvel</strong> para a Raquel priorizar nos antendimentos deste dia.
                        Este campo será <u>limpo automaticamente</u> no fim do seu expediente.
                    </p>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-72">
                        <Input
                            value={focus}
                            onChange={(e) => setFocus(e.target.value)}
                            placeholder="Ex: Reserva Imperial..."
                            className="h-12 sm:h-14 font-bold rounded-xl pr-10 focus-visible:ring-accent/20 focus-visible:border-accent"
                        />
                        {focus && (
                            <button
                                onClick={() => setFocus("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {savedFocus && focus === savedFocus ? (
                        <Button
                            variant="outline"
                            onClick={() => handleSave("")}
                            disabled={isSaving}
                            className="w-full sm:w-auto h-12 sm:h-14 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 uppercase font-black text-[10px] tracking-widest"
                        >
                            Remover
                        </Button>
                    ) : (
                        <Button
                            onClick={() => handleSave(focus)}
                            disabled={isSaving || (!focus && !savedFocus)} // If both empty, nothing to clear
                            className={cn(
                                "w-full sm:w-auto h-12 sm:h-14 rounded-xl uppercase font-black text-[10px] tracking-widest shadow-lg transition-all",
                                focus !== savedFocus ? "bg-accent hover:bg-accent/90 text-white" : "opacity-50"
                            )}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                            {focus ? "Aplicar Foco" : "Limpar Foco"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
