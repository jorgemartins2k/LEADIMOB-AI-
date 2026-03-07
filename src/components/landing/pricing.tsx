"use client";

import { Button } from '@/components/ui/button';
import { Check, Zap, Crown, Building2, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

export function Pricing() {
    const { isSignedIn } = useAuth();
    const plans = [
        {
            name: 'Iniciante',
            price: '2.997',
            description: 'Ideal para corretores solo',
            icon: Zap,
            features: [
                'Até 1.500 leads/mês',
                'Assistente Raquel 24/7',
                'Qualificação Automática',
                'Dash de Leads Básico',
                'Suporte por WhatsApp'
            ],
            highlight: false,
            color: 'accent'
        },
        {
            name: 'PRO',
            price: '4.997',
            description: 'Alta escala e conversão',
            icon: Crown,
            features: [
                'Até 3.000 leads/mês',
                'Prioridade de Processamento',
                'Análise de Crédito Prévia',
                'Dash de Performance Avançado',
                'Onboarding VIP',
                'Consultoria de Conversão'
            ],
            highlight: true,
            color: 'accent'
        },
        {
            name: 'Enterprise',
            price: '7.997',
            description: 'Para grandes imobiliárias',
            icon: Building2,
            features: [
                'Leads Ilimitados*',
                'Múltiplos Atendentes IA',
                'Integração com CRM Próprio',
                'Gerente de Conta Dedicado',
                'Treinamento de Equipe'
            ],
            highlight: false,
            color: 'accent'
        }
    ];

    return (
        <section id="precos" className="py-24 bg-background overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20 animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-black mb-6 border border-accent/20">
                        <Star className="w-4 h-4 fill-accent" />
                        INVESTIMENTO
                    </div>
                    <h2 className="heading-xl mb-4 text-foreground">Planos que cabem no seu bolso</h2>
                    <p className="text-muted-foreground text-xl font-medium">
                        Pare de queimar dinheiro com leads que não compram.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto px-4 sm:px-0">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-[32px] sm:rounded-[48px] p-8 sm:p-12 transition-all duration-500 group ${plan.highlight
                                ? 'bg-primary text-white shadow-[0_30px_60px_-15px_rgba(37,99,235,0.3)] border-4 border-accent lg:scale-105 z-10'
                                : 'bg-muted/30 border border-border/50 hover:bg-muted/50 hover:-translate-y-2'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-full text-center">
                                    <span className="bg-accent text-white px-6 sm:px-8 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-xl border border-white/20 animate-float whitespace-nowrap">
                                        O MAIS VENDIDO
                                    </span>
                                </div>
                            )}

                            <div className="mb-8 sm:mb-12 text-center">
                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl transition-transform duration-500 group-hover:scale-110 ${plan.highlight ? 'bg-accent text-white' : 'bg-primary text-white'
                                    }`}>
                                    <plan.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                                </div>

                                <h3 className={`text-2xl sm:text-3xl font-black mb-3 sm:mb-4 uppercase tracking-tighter ${plan.highlight ? 'text-white' : 'text-foreground'}`}>
                                    {plan.name}
                                </h3>

                                <div className="flex items-center justify-center gap-1 mb-4 sm:mb-6">
                                    <span className={`text-sm sm:text-xl font-bold ${plan.highlight ? 'text-white/60' : 'text-muted-foreground'}`}>R$</span>
                                    <span className={`text-5xl sm:text-7xl font-black tracking-tighter ${plan.highlight ? 'text-white' : 'text-foreground'}`}>
                                        {plan.price}
                                    </span>
                                    <span className={`text-xs sm:text-lg font-medium opacity-60 ${plan.highlight ? 'text-white/60' : 'text-muted-foreground'}`}>/mês</span>
                                </div>

                                <p className={`text-[10px] sm:text-sm font-black uppercase tracking-widest opacity-60 ${plan.highlight ? 'text-white/80' : 'text-muted-foreground'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="space-y-4 sm:space-y-6 mb-10 sm:mb-16">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 sm:gap-4">
                                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-accent/40 text-white' : 'bg-success/20 text-success'
                                            }`}>
                                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-current stroke-[4]" />
                                        </div>
                                        <span className={`text-sm sm:text-base font-bold ${plan.highlight ? 'text-white' : 'text-foreground/80'}`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className={`w-full h-16 sm:h-20 text-base sm:text-lg font-black rounded-2xl sm:rounded-3xl shadow-xl transition-all active:scale-95 uppercase tracking-widest min-h-[48px] ${plan.highlight
                                    ? 'bg-accent text-white hover:brightness-110 shadow-accent/30'
                                    : 'bg-primary text-white hover:opacity-90 shadow-primary/20'
                                    }`}
                                asChild
                            >
                                <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                                    Assinar Agora
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center animate-fade-in opacity-60">
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                        Ativando mais de 500 corretores mensalmente
                    </p>
                </div>
            </div>
        </section>
    );
}
