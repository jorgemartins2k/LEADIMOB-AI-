import { ClipboardList, Bot, Target, Flame } from 'lucide-react';

export function HowItWorks() {
    const steps = [
        {
            icon: ClipboardList,
            step: '01',
            titulo: 'Cadastra Leads',
            desc: 'Importe listas (CSV, Excel) ou adicione manualmente. Atendimento em escala.',
            color: 'accent'
        },
        {
            icon: Bot,
            step: '02',
            titulo: 'IA Inicia Contato',
            desc: 'Processamento instantâneo via WhatsApp. Raquel atende 24h por dia.',
            color: 'purple'
        },
        {
            icon: Target,
            step: '03',
            titulo: 'IA Qualifica',
            desc: 'Identifica perfil, ticket, urgência e oferece imóveis compatíveis.',
            color: 'cyan'
        },
        {
            icon: Flame,
            step: '04',
            titulo: 'Você Fecha',
            desc: 'Notificação instantânea quando o lead está pronto para visitar o imóvel.',
            color: 'hot'
        }
    ];

    return (
        <section id="funcionalidades" className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="heading-xl text-foreground mb-4">
                        Como Funciona
                    </h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Processo 100% automatizado para você focar no que importa: o fechamento.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto px-4 sm:px-0">
                    {steps.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div key={i} className="group h-full">
                                <div className="bg-muted/30 hover:bg-muted/50 rounded-[28px] sm:rounded-[32px] p-8 sm:p-10 border border-border h-full transition-all duration-300 card-hover flex flex-col">
                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl mb-6 flex items-center justify-center bg-${item.color}/10 text-${item.color} shadow-sm flex-shrink-0`}>
                                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                                    </div>
                                    <div className={`text-[10px] sm:text-xs font-black uppercase tracking-widest text-${item.color} mb-3 opacity-80`}>PASSO {item.step}</div>
                                    <h3 className="text-lg sm:text-xl font-black text-foreground mb-4">{item.titulo}</h3>
                                    <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed opacity-90">{item.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
