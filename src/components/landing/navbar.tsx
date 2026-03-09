"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useAuth, UserButton } from '@clerk/nextjs';
import { LeadImobLogo } from '@/components/LeadImobLogo';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-background/95 backdrop-blur-md border-b border-border py-3" : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LeadImobLogo variant="standard" iconSize={36} fontSize="text-2xl" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('funcionalidades')}
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Funcionalidades
            </button>
            <button
              onClick={() => scrollToSection('calculadora')}
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Calculadora de Vendas
            </button>
            <button
              onClick={() => scrollToSection('precos')}
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Preços
            </button>

            <div className="flex items-center gap-3 ml-4">
              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <Button variant="ghost" className="font-bold" asChild>
                    <Link href="/dashboard">Meu Painel</Link>
                  </Button>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="font-bold text-muted-foreground hover:text-foreground transition-all"
                    asChild
                  >
                    <Link href="/sign-in">
                      <LogIn className="w-4 h-4 mr-2" />
                      Entrar
                    </Link>
                  </Button>
                  <Button
                    className="btn-primary font-bold px-6"
                    asChild
                  >
                    <Link href="/sign-up">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Começar Agora
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <button
            className="md:hidden p-2 text-foreground min-w-[48px] min-h-[48px] flex items-center justify-center transition-transform active:scale-90"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden fixed inset-x-0 top-0 pt-24 pb-10 bg-background/98 backdrop-blur-xl border-b border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform z-[40]",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        )}>
          <div className="container mx-auto px-4 space-y-2">
            <button
              onClick={() => scrollToSection('funcionalidades')}
              className="flex items-center w-full px-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all min-h-[48px]"
            >
              Funcionalidades
            </button>
            <button
              onClick={() => scrollToSection('calculadora')}
              className="flex items-center w-full px-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all min-h-[48px]"
            >
              Calculadora de Vendas
            </button>
            <button
              onClick={() => scrollToSection('precos')}
              className="flex items-center w-full px-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all min-h-[48px]"
            >
              Preços
            </button>

            <div className="pt-8 mt-6 border-t border-border/50 space-y-4 px-2">
              {isSignedIn ? (
                <Button className="w-full btn-primary font-black uppercase tracking-widest text-[11px] h-16 rounded-2xl" asChild>
                  <Link href="/dashboard">Meu Painel</Link>
                </Button>
              ) : (
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full font-black uppercase tracking-widest text-[11px] h-16 rounded-max border-border/50 bg-background" asChild>
                    <Link href="/sign-in">Entrar</Link>
                  </Button>
                  <Button className="w-full btn-primary font-black uppercase tracking-widest text-[11px] h-16 rounded-max shadow-xl shadow-primary/20" asChild>
                    <Link href="/sign-up">Teste Grátis</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
