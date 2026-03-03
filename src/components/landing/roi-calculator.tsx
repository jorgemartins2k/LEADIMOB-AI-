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
        <section id="calculadora" className="py-32 bg-muted/30 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center gap-2 bg-purple/10 text-purple px-5 py-2 rounded-full text-xs font-black mb-8 border border-purple/20 tracking-widest uppercase">
                            <Calculator className="w-4 h-4" />
                            Simular Faturamento
                        </div>
                        <h2 className="heading-xl mb-6">Sua Fábrica de Vendas Automática</h2>
                        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
                            Ajuste o volume de leads e veja em segundos como a Raquel transforma <span className="text-foreground font-black">conversas em comissões.</span>
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-0 items-stretch bg-card rounded-[48px] border border-border shadow-2xl overflow-hidden shadow-primary/5">
                        {/* Input Section */}
                        <div className="lg:col-span-3 p-10 md:p-16 space-y-16">
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xl font-black uppercase tracking-tighter">Volume de Leads/Mês</label>
                                        <p className="text-sm text-muted-foreground font-medium">Quantidade que você recebe mensalmente</p>
                                    </div>
                                    <span className="text-4xl font-black text-foreground tracking-tighter">
                                        {leads.toLocaleString()}
                                        <span className="text-accent ml-2 text-xl tracking-normal uppercase">leads</span>
                                    </span>
                                </div>

                                <Slider
                                    value={[leads]}
                                    onValueChange={(val) => setLeads(val[0])}
                                    max={10000}
                                    step={500}
                                    min={500}
                                    className="py-10"
                                />

                                <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">
                                    <span>Pequeno Porte</span>
                                    <span>Escala Média</span>
                                    <span>Alta Performance</span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="group flex flex-col gap-6 p-8 bg-muted/20 rounded-[32px] border border-border/50 transition-all hover:bg-muted/40 card-hover">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Qualificados pela IA</span>
                                        <Flame className="w-6 h-6 text-hot group-hover:scale-120 transition-transform" />
                                    </div>
                                    <span className="text-5xl font-black text-foreground tracking-tighter">{quentes}</span>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">Prontos para fechamento</p>
                                </div>

                                <div className="group flex flex-col gap-6 p-8 bg-muted/20 rounded-[32px] border border-border/50 transition-all hover:bg-muted/40 card-hover">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visitas Reais</span>
                                        <TrendingUp className="w-6 h-6 text-accent group-hover:scale-120 transition-transform" />
                                    </div>
                                    <span className="text-5xl font-black text-foreground tracking-tighter">{visitas}</span>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">Agendamentos automáticos</p>
                                </div>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="lg:col-span-2 bg-primary p-10 md:p-16 flex flex-col justify-between text-white relative">
                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />

                            <div className="space-y-12 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-accent/20 rounded-lg">
                                            <DollarSign className="w-5 h-5 text-accent" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-accent">Faturamento Estimado</span>
                                    </div>
                                    <h3 className="text-6xl md:text-7xl font-black leading-none tracking-tighter">
                                        R$ {receita.toLocaleString()}
                                    </h3>
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Base comissão média: R$ 15k</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black uppercase tracking-widest text-white/40">ROI Mensal</span>
                                        <span className="text-4xl font-black text-accent">{Math.round(roi)}%</span>
                                    </div>
                                    <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
                                        <div className="bg-accent h-full rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-out" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-16 relative z-10">
                                <Button
                                    className="w-full bg-white text-primary hover:bg-white/90 h-16 md:h-20 text-lg font-black rounded-3xl shadow-2xl shadow-black/40 group active:scale-95 transition-all uppercase tracking-widest"
                                    asChild
                                >
                                    <Link href="/sign-up">
                                        ASSINAR PLANO {plano.split(' ')[0]}
                                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                                    </Link>
                                </Button>
                                <p className="text-center text-[10px] uppercase font-black tracking-[0.3em] mt-8 opacity-40">Ativação imediata via WhatsApp</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
