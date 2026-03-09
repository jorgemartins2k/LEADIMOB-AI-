import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FinalCTA() {
    return (
        <section className="py-24 bg-primary relative overflow-hidden">
            {/* Decorative Lights */}
            <div className="absolute top-0 right-0 w-[40%] h-full bg-accent opacity-10 blur-[150px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[30%] h-full bg-white opacity-5 blur-[120px] -z-10" />

            <div className="container mx-auto px-4 sm:px-6 text-center">
                <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 animate-fade-in px-2 sm:px-0">
                    <div className="inline-flex items-center gap-2 bg-white/10 text-white px-5 sm:px-6 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border border-white/20 mb-2 sm:mb-4">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 h-4 text-warning" />
                        COMECE HOJE MESMO
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter">
                        Pare de queimar dinheiro com Leads Curiosos.<br />
                        <span className="text-accent underline decoration-accent/30 underline-offset-4 sm:underline-offset-8">Venda com Inteligência.</span>
                    </h2>

                    <p className="text-base sm:text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed opacity-90">
                        Seja um dos mais de 500 corretores que utilizam a Raquel para dominar o mercado imobiliário em suas regiões.
                    </p>

                    <div className="pt-4 sm:pt-6">
                        <Button
                            size="lg"
                            className="bg-white text-primary hover:bg-white/90 h-16 sm:h-20 px-8 sm:px-12 text-sm sm:text-xl font-black rounded-2xl sm:rounded-3xl shadow-2xl transition-all group flex items-center gap-3 sm:gap-4 mx-auto w-full sm:w-auto justify-center min-h-[48px]"
                            asChild
                        >
                            <Link href="/sign-up">
                                CRIAR MINHA CONTA GRÁTIS
                                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </Button>
                        <p className="text-white/40 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-6 sm:mt-8">
                            Cartão de crédito não necessário para o teste
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
