import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, ShieldCheck, Zap } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Hero Section */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-surface-2 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-display font-bold">L</span>
          </div>
          <span className="text-xl font-display font-bold text-text">Leadimob AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-text">Entrar</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-primary hover:bg-primary-dark text-white">Criar Conta</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 py-24 md:py-32 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-4 h-4 fill-primary" />
            <span>A Revolução do Atendimento Imobiliário</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-text mb-6 tracking-tight max-w-4xl">
            A Raquel atende seus leads <span className="text-primary italic">mesmo enquanto você dorme.</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl leading-relaxed">
            Nossa Inteligência Artificial conversa com seus clientes no WhatsApp, qualifica leads e agenda visitas direto na sua agenda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/sign-up">
              <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary-dark text-white gap-2 rounded-2xl">
                Começar Agora Gratis <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-surface-2 text-text hover:bg-surface rounded-2xl">
              Ver Demonstração
            </Button>
          </div>
        </section>

        <section className="px-6 py-24 bg-surface/30 border-y border-surface-2">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-surface border border-surface-2 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-text mb-3">Atendimento Humanizado</h3>
              <p className="text-text-muted leading-relaxed">Raquel conversa de forma natural, tirando dúvidas e mantendo o lead aquecido.</p>
            </div>
            <div className="p-8 rounded-3xl bg-surface border border-surface-2 hover:border-secondary/30 transition-all group">
              <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-secondary w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-text mb-3">Qualificação Automática</h3>
              <p className="text-text-muted leading-relaxed">Filtre leads curiosos e foque apenas em quem realmente tem potencial de compra.</p>
            </div>
            <div className="p-8 rounded-3xl bg-surface border border-surface-2 hover:border-accent/30 transition-all group">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-accent w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-text mb-3">Integração Total</h3>
              <p className="text-text-muted leading-relaxed">Conecte seus produtos, agenda e WhatsApp em uma única plataforma inteligente.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 border-t border-surface-2 text-center text-text-muted">
        <p>&copy; 2026 Leadimob AI. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
