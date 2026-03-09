export function AboutUs() {
    return (
        <section id="sobre" className="py-24 bg-muted/20 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="heading-xl text-foreground mb-6">
                            Nossa História
                        </h2>
                        <p className="text-xl md:text-2xl text-foreground font-black italic">
                            "De uma frustração real nasceu a IA que está transformando o mercado imobiliário."
                        </p>
                    </div>

                    <div className="space-y-6 sm:space-y-8 text-muted-foreground text-base sm:text-lg font-medium leading-relaxed px-2 sm:px-0">
                        <p>
                            <span className="text-foreground font-black">Janeiro de 2026.</span> Franklyn Martins, corretor com anos de experiência,
                            ligou para o primo Jorge com uma frustração que todo profissional da área conhece:
                        </p>

                        <div className="border-l-4 border-accent pl-5 sm:pl-8 py-4 sm:py-6 italic text-foreground text-lg sm:text-xl bg-accent/5 rounded-r-[24px] sm:rounded-r-[32px] font-bold">
                            "Recebo centenas de leads, mas só consigo atender uma fração. Perco horas com curiosos e os
                            leads quentes acabam indo para a concorrência pela demora no resposta."
                        </div>

                        <p>
                            Jorge, apaixonado por tecnologia e automação, propôs um desafio:
                        </p>

                        <div className="border-l-4 border-success pl-5 sm:pl-8 py-4 sm:py-6 italic text-foreground text-lg sm:text-xl bg-success/5 rounded-r-[24px] sm:rounded-r-[32px] font-bold">
                            "E se criássemos uma IA que fizesse todo o atendimento pesado e você cuidasse apenas do fechamento?"
                        </div>

                        <p>
                            Assim nasceu a <span className="text-foreground font-black">Raquel</span>, a IA da LeadImob.
                            Diferente de chatbots simples, ela entende o contexto, qualifica o lead por perfil e
                            notifica o corretor no momento exato da compra.
                        </p>
                    </div>

                    {/* Founders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-16 sm:mt-20 px-2 sm:px-0">
                        <div className="bg-card rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 border border-border shadow-soft card-hover border-b-8 border-b-accent">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl font-black mb-6 shadow-xl shadow-accent/20">
                                JM
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-foreground mb-1">
                                Jorge Martins
                            </h3>
                            <p className="text-accent font-black text-[10px] sm:text-xs uppercase tracking-widest mb-6">CEO & Founder</p>
                            <p className="text-sm sm:text-base text-muted-foreground italic font-medium opacity-80">
                                "A tecnologia deve ser o braço direito do corretor, eliminando o trabalho braçal e permitindo o foco na estratégia."
                            </p>
                        </div>

                        <div className="bg-card rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 border border-border shadow-soft card-hover border-b-8 border-b-success">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl font-black mb-6 shadow-xl shadow-success/20">
                                FM
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-foreground mb-1">
                                Franklyn Martins
                            </h3>
                            <p className="text-success font-black text-[10px] sm:text-xs uppercase tracking-widest mb-6">CSO & Co-Founder</p>
                            <p className="text-sm sm:text-base text-muted-foreground italic font-medium opacity-80">
                                "Vivi a dor e criei a cura. Ninguém melhor que um corretor para saber o que um corretor realmente precisa."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
