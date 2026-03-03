"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';
import { ArrowRight, Calculator, TrendingUp, DollarSign, Flame } from 'lucide-react';

export function ROICalculator() {
    const [leads, setLeads] = useState(3000);

    // Cálculos baseados nos parâmetros Lovable
    const quentes = Math.round(leads * 0.053);
    const visitas = Math.round(quentes * 0.65);
    const vendas = Math.round(visitas * 0.175);
    const comissaoMedia = 15000; // Aumentado um pouco para ser mais atrativo
    const receita = vendas * comissaoMedia;

    let preco: number, plano: string;
    if (leads <= 1500) {
        preco = 2997;
        plano = "Iniciante";
    } else if (leads <= 3000) {
        preco = 4997;
        plano = "PRO";
    } else {
        preco = 7997;
        plano = "Premium";
    }

    const roi = ((receita - preco) / preco) * 100;

    return (
        <section id="calculadora" className="py-24 bg-muted/30 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-purple/10 text-purple px-4 py-1.5 rounded-full text-sm font-black mb-6 border border-purple/20">
                            <Calculator className="w-4 h-4" />
                            SIMULADOR DE RESULTADOS
                        </div>
                        <h2 className="heading-xl mb-4">Calculadora de ROI Automática</h2>
                        <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">
                            Ajuste o volume de leads e veja como a Raquel transforma seu faturamento.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-0 items-stretch bg-card rounded-[40px] border border-border shadow-2xl overflow-hidden">
                        {/* Input Section */}
                        <div className="lg:col-span-3 p-10 md:p-14 space-y-12">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <label className="text-lg font-black uppercase tracking-wider">Volume de Leads/Mês</label>
                                        <p className="text-sm text-muted-foreground font-medium">Quantos novos leads você recebe mensalmente?</p>
                                    </div>
                                    <span className="text-3xl font-black text-foreground">{leads.toLocaleString()}<span className="text-accent ml-1">leads</span></span>
                                </div>

                                <Slider
                                    value={[leads]}
                                    onValueChange={(val) => setLeads(val[0])}
                                    max={10000}
                                    step={500}
                                    min={500}
                                    className="py-6"
                                />

                                <div className="flex justify-between text-xs font-black text-muted-foreground uppercase opacity-50 tracking-tighter">
                                    <span>500 Leads</span>
                                    <span>5.000 Leads</span>
                                    <span>10.000 Leads</span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-4 p-6 bg-muted/50 rounded-3xl border border-border/50 transition-all hover:bg-muted/80">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Qualificados pela IA</span>
                                        <Flame className="w-5 h-5 text-hot" />
                                    </div>
                                    <span className="text-4xl font-black text-foreground">{quentes}</span>
                                    <p className="text-xs text-muted-foreground font-bold">Leads prontos para agendar</p>
                                </div>

                                <div className="flex flex-col gap-4 p-6 bg-muted/50 rounded-3xl border border-border/50 transition-all hover:bg-muted/80">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Visitas Reais</span>
                                        <TrendingUp className="w-5 h-5 text-accent" />
                                    </div>
                                    <span className="text-4xl font-black text-foreground">{visitas}</span>
                                    <p className="text-xs text-muted-foreground font-bold">Agendamentos automáticos</p>
                                </div>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="lg:col-span-2 bg-primary p-10 md:p-14 flex flex-col justify-between text-white relative">
                            {/* Background accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-20 blur-3xl -z-10" />

                            <div className="space-y-10">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-5 h-5 text-accent" />
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-accent">Faturamento Estimado</span>
                                    </div>
                                    <h3 className="text-5xl md:text-6xl font-black leading-none tracking-tighter">
                                        R$ {receita.toLocaleString()}
                                    </h3>
                                    <p className="text-sm font-bold opacity-60 italic text-white/80">*Comissão média: R$ 15k</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black uppercase tracking-widest opacity-70">ROI Estimado</span>
                                        <span className="text-3xl font-black text-accent">{Math.round(roi)}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                                        <div className="bg-accent h-full rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10">
                                <Button
                                    className="w-full bg-white text-primary hover:bg-white/90 h-16 text-lg font-black rounded-2xl shadow-xl shadow-black/20 group"
                                    asChild
                                >
                                    <Link href="/sign-up">
                                        QUERO O PLANO {plano.split(' ')[0].toUpperCase()}
                                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                                <p className="text-center text-[10px] uppercase font-black tracking-widest mt-6 opacity-40">Setup em menos de 24 horas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
