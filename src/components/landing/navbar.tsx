"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { LeadImobLogo } from '@/components/LeadImobLogo';
import { useAuth, UserButton } from '@clerk/nextjs';

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border py-3' : 'bg-transparent py-5'
      }`}>
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pt-4 pb-6 space-y-4 animate-fade-in">
            <button
              onClick={() => scrollToSection('funcionalidades')}
              className="block w-full text-left py-2 text-lg font-bold text-muted-foreground"
            >
              Funcionalidades
            </button>
            <button
              onClick={() => scrollToSection('calculadora')}
              className="block w-full text-left py-2 text-lg font-bold text-muted-foreground"
            >
              Calculadora de Vendas
            </button>
            <button
              onClick={() => scrollToSection('precos')}
              className="block w-full text-left py-2 text-lg font-bold text-muted-foreground"
            >
              Preços
            </button>

            <div className="pt-4 border-t border-border space-y-3">
              {isSignedIn ? (
                <Button className="w-full btn-primary font-bold py-6" asChild>
                  <Link href="/dashboard">Meu Painel</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full font-bold py-6" asChild>
                    <Link href="/sign-in">Entrar</Link>
                  </Button>
                  <Button className="w-full btn-primary font-bold py-6" asChild>
                    <Link href="/sign-up">Teste Grátis</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
