"use client";

import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Flame, MessageSquare, Calendar } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple/10 blur-[100px] rounded-full" />
            </div>

            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <div className="animate-fade-in text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-extrabold mb-8 ring-1 ring-accent/20">
                            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                            IA para Corretores de Imóveis
                        </div>

                        <h1 className="heading-hero text-foreground mb-8">
                            Transforme 3.000 leads em{' '}
                            <span className="text-gradient-accent">
                                até 8 vendas por mês
                            </span>
                        </h1>

                        <p className="text-body text-lg md:text-xl mb-12 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                            A Raquel é a sua assistente de IA que prospecta, qualifica e entrega o lead quente direto no seu WhatsApp.
                            <span className="text-foreground font-semibold"> Você só se preocupa em fechar.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 mb-16 justify-center lg:justify-start">
                            <Button
                                size="lg"
                                className="btn-primary group h-16 px-10 text-base font-semibold uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                asChild
                            >
                                <Link href="/sign-up">
                                    Começar agora
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-16 px-10 text-base font-semibold uppercase tracking-wider border-2 border-border/50 hover:bg-muted/50 hover:border-accent transition-all rounded-[24px] btn-interactive"
                                onClick={() => {
                                    document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Agendar Demo
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground font-semibold uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-accent" />
                                Setup Rápido
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-purple" />
                                Atendimento 24/7
                            </div>
                            <div className="flex items-center gap-2">
                                <Flame className="w-5 h-5 text-hot" />
                                Leads Hot
                            </div>
                        </div>
                    </div>

                    {/* Visual Element */}
                    <div className="relative animate-fade-in-right hidden lg:block">
                        <div className="relative z-10 glass-effect rounded-[32px] p-8 overflow-hidden">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-border/50 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20">
                                            <Flame className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">Novo Lead Qualificado</h3>
                                            <p className="text-sm text-muted-foreground font-bold opacity-60">Origem: Instagram Ads</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1.5 bg-success/20 text-success rounded-full text-xs font-black uppercase tracking-widest border border-success/30">
                                        Propensão Alta
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-muted/50 rounded-2xl p-5 border border-border/50 shadow-sm transition-all hover:bg-muted/70">
                                        <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-2 opacity-50">Lead Mensagem</p>
                                        <p className="font-bold text-foreground">"Olá, vi o anúncio da cobertura no Leblon. Tenho urgência e já possuo 30% de entrada."</p>
                                    </div>

                                    <div className="bg-accent/5 rounded-2xl p-5 border border-accent/20 shadow-inner">
                                        <p className="text-accent text-xs font-black uppercase tracking-widest mb-2">Raquel (IA)</p>
                                        <p className="font-bold text-foreground leading-relaxed">"Excelente escolha! Já verifiquei a disponibilidade e analisei seu perfil. Posso agendar sua visita para amanhã às 10h?"</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="w-10 h-10 rounded-full border-4 border-card bg-muted flex items-center justify-center text-xs font-black text-foreground shadow-md">
                                                    {String.fromCharCode(64 + i)}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-foreground">+52 Leads</p>
                                            <p className="text-xs font-bold text-muted-foreground opacity-60 italic">convertidos hoje</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Badges flutuantes */}
                            <div className="absolute top-6 right-8 bg-success/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl animate-float flex items-center gap-2 border border-white/20">
                                <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Sistema Ativo</span>
                            </div>

                            <div className="absolute bottom-8 left-8 bg-white/90 dark:bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-xl animate-float-delayed border border-border">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-6 h-6 text-accent" />
                                    <div>
                                        <span className="text-xs font-black text-foreground uppercase block mb-1">Visita Confirmada</span>
                                        <span className="text-sm font-bold text-muted-foreground">Amanhã, 10:00h</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ambient Light */}
                        <div className="absolute -top-12 -right-12 w-64 h-64 bg-accent/20 blur-[100px] -z-10 rounded-full" />
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple/20 blur-[80px] -z-10 rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    );
}
