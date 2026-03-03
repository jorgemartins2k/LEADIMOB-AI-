import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FinalCTA() {
    return (
        <section className="py-24 bg-primary relative overflow-hidden">
            {/* Decorative Lights */}
            <div className="absolute top-0 right-0 w-[40%] h-full bg-accent opacity-10 blur-[150px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[30%] h-full bg-white opacity-5 blur-[120px] -z-10" />

            <div className="container mx-auto px-6 text-center">
                <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-white/20 mb-4">
                        <Sparkles className="w-4 h-4 text-warning" />
                        COMECE HOJE MESMO
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter">
                        Pare de queimar dinheiro com Leads Curiosos.<br />
                        <span className="text-accent underline decoration-accent/30 underline-offset-8">Venda com Inteligência.</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
                        Seja um dos mais de 500 corretores que utilizam a Raquel para dominar o mercado imobiliário em suas regiões.
                    </p>

                    <div className="pt-6">
                        <Button
                            size="lg"
                            className="bg-white text-primary hover:bg-white/90 h-20 px-12 text-xl font-black rounded-3xl shadow-2xl hover:scale-105 transition-all group flex items-center gap-4 mx-auto"
                            asChild
                        >
                            <Link href="/sign-up">
                                CRIAR MINHA CONTA GRÁTIS
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </Button>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-8">
                            Cartão de crédito não necessário para o teste
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
