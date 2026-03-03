"use client";

import { LeadImobLogo } from '@/components/LeadImobLogo';
import Link from 'next/link';

export function Footer() {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
        }
    };

    return (
        <footer className="bg-primary text-white py-20">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    <div className="md:col-span-2 space-y-8">
                        <LeadImobLogo className="text-white brightness-0 invert" />
                        <p className="text-white/60 text-lg font-medium leading-relaxed max-w-sm">
                            A revolução do atendimento imobiliário através de Inteligência Artificial proprietária.
                            Simples. Direto. Lucrativo.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-accent mb-8">Navegação</h3>
                        <ul className="space-y-4 font-bold">
                            <li>
                                <button onClick={() => scrollToSection('funcionalidades')} className="text-white/60 hover:text-white transition-colors">
                                    Funcionalidades
                                </button>
                            </li>
                            <li>
                                <button onClick={() => scrollToSection('calculadora')} className="text-white/60 hover:text-white transition-colors">
                                    ROI Automático
                                </button>
                            </li>
                            <li>
                                <button onClick={() => scrollToSection('precos')} className="text-white/60 hover:text-white transition-colors">
                                    Planos & Preços
                                </button>
                            </li>
                            <li>
                                <button onClick={() => scrollToSection('sobre')} className="text-white/60 hover:text-white transition-colors">
                                    Sobre Nós
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-accent mb-8">Suporte</h3>
                        <ul className="space-y-4 font-bold">
                            <li>
                                <a href="mailto:contato@leadimob.ai" className="text-white/60 hover:text-white transition-colors">
                                    contato@leadimob.ai
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white/60 hover:text-white transition-colors">
                                    Termos de Uso
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white/60 hover:text-white transition-colors">
                                    Privacidade
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">
                        © 2026 LEADIMOB AI. Tecnologia para o topo do mercado.
                    </p>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                            <span className="text-[10px] font-black">IG</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                            <span className="text-[10px] font-black">LI</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                            <span className="text-[10px] font-black">X</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
