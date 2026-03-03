import { Button } from '@/components/ui/button';
import { Check, Zap, Crown, Building2, Star } from 'lucide-react';
import Link from 'next/link';

export function Pricing() {
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

                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-[40px] p-10 transition-all duration-300 ${plan.highlight
                                    ? 'bg-primary text-white shadow-2xl shadow-accent/20 border-4 border-accent lg:scale-105 z-10'
                                    : 'bg-muted/30 border border-border hover:bg-muted/50 card-hover'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                    <span className="bg-accent text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg border border-white/20">
                                        O MAIS VENDIDO
                                    </span>
                                </div>
                            )}

                            <div className="mb-10 text-center">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${plan.highlight ? 'bg-accent text-white' : 'bg-primary text-white'
                                    }`}>
                                    <plan.icon className="w-8 h-8" />
                                </div>

                                <h3 className={`text-2xl font-black mb-2 ${plan.highlight ? 'text-white' : 'text-foreground'}`}>
                                    {plan.name}
                                </h3>

                                <div className="flex items-center justify-center gap-1 mb-4">
                                    <span className={`text-xl font-black mb-4 ${plan.highlight ? 'text-white/60' : 'text-muted-foreground'}`}>R$</span>
                                    <span className={`text-6xl font-black tracking-tighter ${plan.highlight ? 'text-white' : 'text-foreground'}`}>
                                        {plan.price}
                                    </span>
                                    <span className={`text-lg font-bold ${plan.highlight ? 'text-white/60' : 'text-muted-foreground'}`}>/mês</span>
                                </div>

                                <p className={`text-sm font-bold opacity-80 ${plan.highlight ? 'text-white/80' : 'text-muted-foreground'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="space-y-5 mb-12">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-accent/40 text-white' : 'bg-success/20 text-success'
                                            }`}>
                                            <Check className="w-4 h-4 text-current stroke-[3]" />
                                        </div>
                                        <span className={`text-base font-bold ${plan.highlight ? 'text-white' : 'text-foreground/80'}`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className={`w-full h-16 text-lg font-black rounded-2xl shadow-xl transition-all active:scale-95 ${plan.highlight
                                        ? 'bg-accent text-white hover:bg-accent/90 shadow-accent/20'
                                        : 'bg-primary text-white hover:opacity-90'
                                    }`}
                                asChild
                            >
                                <Link href="/sign-up">
                                    Começar Agora
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
