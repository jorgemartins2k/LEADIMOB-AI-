"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';
import { ArrowRight, Calculator, TrendingUp, DollarSign, Zap, Crown, Building2 } from 'lucide-react';

export function SalesCalculator() {
    const [leads, setLeads] = useState(1500);

    // Nova lógica: 8 vendas para cada 3000 leads (0.266% de conversão)
    // v = (l / 3000) * 8
    const vendas = Math.round((leads / 3000) * 8);
    const comissaoMedia = 15000;
    const receita = vendas * comissaoMedia;

    let preco: string, plano: string, Icon: any;
    if (leads <= 1500) {
        preco = "2.997";
        plano = "Iniciante";
        Icon = Zap;
    } else if (leads <= 3000) {
        preco = "4.997";
        plano = "PRO";
        Icon = Crown;
    } else {
        preco = "7.997";
        plano = "Enterprise";
        Icon = Building2;
    }

    return (
        <section id="calculadora" className="py-32 bg-muted/30 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center gap-2 bg-purple/10 text-purple px-5 py-2 rounded-full text-xs font-black mb-8 border border-purple/20 tracking-widest uppercase">
                            <Calculator className="w-4 h-4" />
                            Simular Resultados
                        </div>
                        <h2 className="heading-xl mb-6">Calculadora de Vendas</h2>
                        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
                            Ajuste o volume de leads e veja o potencial de fechamento com a ajuda da <span className="text-foreground font-black">Raquel</span>.
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
                                    max={5000}
                                    step={500}
                                    min={1500}
                                    className="py-10"
                                />

                                <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">
                                    <span>Até 1.500</span>
                                    <span>Até 3.000</span>
                                    <span>Escala 5.000</span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-1 gap-8">
                                <div className="group flex flex-col items-center justify-center text-center gap-6 p-12 bg-muted/20 rounded-[40px] border border-border/50 transition-all hover:bg-muted/40 card-hover">
                                    <div className="flex items-center gap-4 bg-primary/10 px-6 py-2 rounded-full">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Previsão de Fechamentos</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-7xl font-black text-foreground tracking-tighter">{vendas}</span>
                                        <span className="text-xl font-bold text-muted-foreground uppercase">Vendas / Mês</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium max-w-xs">
                                        Baseado na performance média da Raquel para este volume de leads.
                                    </p>
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
                                        <span className="text-xs font-black uppercase tracking-widest text-accent">Comissão Estimada</span>
                                    </div>
                                    <h3 className="text-6xl md:text-7xl font-black leading-none tracking-tighter">
                                        R$ {receita.toLocaleString()}
                                    </h3>
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Ticket médio de mercado</p>
                                </div>

                                <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Icon className="w-5 h-5 text-accent" />
                                        <span className="text-xs font-black uppercase tracking-widest text-white/60">Plano Recomendado</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-2xl font-black uppercase tracking-tighter">{plano}</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-bold text-white/40">R$</span>
                                            <span className="text-3xl font-black text-accent">{preco}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-16 relative z-10">
                                <Button
                                    className="w-full bg-white text-primary hover:bg-white/90 h-16 md:h-20 text-lg font-black rounded-3xl shadow-2xl shadow-black/40 group active:scale-95 transition-all uppercase tracking-widest"
                                    asChild
                                >
                                    <Link href="/sign-up">
                                        ESCOLHER PLANO {plano.split(' ')[0]}
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
