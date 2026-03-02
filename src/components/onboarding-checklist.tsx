"use client";

import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
    { id: "profile", title: "Completar Perfil", description: "Adicione sua foto e nome da imobiliária.", completed: true },
    { id: "whatsapp", title: "Conectar WhatsApp", description: "Escaneie o QR Code para a Raquel começar a atender.", completed: false },
    { id: "schedule", title: "Configurar Expediente", description: "Defina os horários que você quer que a Raquel trabalhe.", completed: false },
    { id: "properties", title: "Adicionar Imóveis", description: "Cadastre seu portfólio para a Raquel oferecer aos leads.", completed: false },
];

export function OnboardingChecklist() {
    const completedCount = steps.filter(s => s.completed).length;
    const progress = (completedCount / steps.length) * 100;

    return (
        <Card className="bg-surface border-surface-2 overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="font-display text-xl">Configuração Inicial</CardTitle>
                    <span className="text-sm font-medium text-primary">{completedCount}/{steps.length} concluídos</span>
                </div>
                <CardDescription>Siga os passos abaixo para ativar a Raquel 100%.</CardDescription>
                <div className="w-full h-2 bg-surface-2 rounded-full mt-4 overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={cn(
                            "flex items-start gap-4 p-3 rounded-xl border transition-all duration-200",
                            step.completed
                                ? "bg-secondary/5 border-secondary/20"
                                : "bg-surface-2/30 border-transparent hover:border-surface-2"
                        )}
                    >
                        <div className="mt-1">
                            {step.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-secondary" />
                            ) : (
                                <Circle className="h-5 w-5 text-text-muted" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className={cn("text-sm font-semibold", step.completed ? "text-text" : "text-text")}>
                                {step.title}
                            </h4>
                            <p className="text-xs text-text-muted mt-0.5">{step.description}</p>
                        </div>
                        {!step.completed && (
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
