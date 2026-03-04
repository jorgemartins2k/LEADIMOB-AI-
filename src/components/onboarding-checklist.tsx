"use client";

import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const steps = [
    { id: "profile", title: "Completar Perfil", description: "Adicione sua foto e nome da imobiliária.", completed: true },
    { id: "whatsapp", title: "WhatsApp de Notificações", description: "Cadastre seu número para receber alertas quando Raquel aquecer um lead.", completed: false },
    { id: "schedule", title: "Configurar Expediente", description: "Defina os horários que você quer que a Raquel trabalhe.", completed: false },
    { id: "properties", title: "Adicionar Imóveis", description: "Cadastre seu portfólio para a Raquel oferecer aos leads.", completed: false },
];

export function OnboardingChecklist() {
    const completedCount = steps.filter(s => s.completed).length;
    const progress = (completedCount / steps.length) * 100;

    return (
        <Card className="bg-card border-border overflow-hidden shadow-soft">
            <CardHeader className="pb-4 bg-muted/20 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="font-display text-xl text-foreground">Configuração Inicial</CardTitle>
                    <span className="text-sm font-bold text-primary">{completedCount}/{steps.length} concluídos</span>
                </div>
                <CardDescription className="text-muted-foreground font-medium">Siga os passos abaixo para ativar a Raquel 100%.</CardDescription>
                <div className="w-full h-2 bg-muted rounded-full mt-4 overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(30,41,59,0.3)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={cn(
                            "flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 card-hover",
                            step.completed
                                ? "bg-success/10 border-success/30"
                                : "bg-muted/10 border-transparent hover:border-border"
                        )}
                    >
                        <div className="mt-1">
                            {step.completed ? (
                                <CheckCircle2 className="h-6 w-6 text-success" />
                            ) : (
                                <Circle className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className={cn("text-base font-bold text-foreground")}>
                                {step.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                        </div>
                        {!step.completed && (
                            <Link href={step.id === "profile" ? "/configuracoes" : step.id === "whatsapp" ? "/configuracoes" : step.id === "schedule" ? "/configuracoes/expediente" : "/imoveis/novo"}>
                                <Button size="icon" variant="ghost" className="rounded-full shadow-sm hover:bg-primary/10 hover:text-primary">
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
