"use client";

import { useState } from "react";
import { User, Bell, Clock, Save, Camera, Smartphone, Mail, Globe, Hash, Info, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ConfiguraçõesPage() {
    const [activeTab, setActiveTab] = useState("horarios");

    const tabs = [
        { id: "horarios", label: "Horários de Atendimento", icon: Clock },
        { id: "notificacoes", label: "Notificações", icon: Bell },
        { id: "dados", label: "Dados Pessoais", icon: User },
    ];

    const days = [
        { name: "Segunda-feira", active: true },
        { name: "Terça-feira", active: true },
        { name: "Quarta-feira", active: true },
        { name: "Quinta-feira", active: true },
        { name: "Sexta-feira", active: true },
        { name: "Sábado", active: false },
        { name: "Domingo", active: false },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="heading-xl text-foreground">Configurações do <span className="text-gradient-accent">Sistema</span></h1>
                    <p className="text-body font-medium leading-relaxed">Personalize sua experiência e os parâmetros de atuação da <span className="text-foreground font-black">Raquel</span>.</p>
                </div>
                <div className="px-5 py-2 bg-success/10 text-success rounded-full text-[10px] font-black uppercase tracking-widest border border-success/20 flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    Notificações Ativas
                </div>
            </div>

            {/* Tabs Design v2 */}
            <div className="flex items-center gap-4 bg-muted/20 p-2.5 rounded-[32px] w-fit overflow-x-auto no-scrollbar border border-border/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-3 px-10 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap btn-interactive",
                            activeTab === tab.id
                                ? "bg-foreground text-background shadow-2xl shadow-black/20"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content with card-premium */}
            <div className="card-premium p-10 md:p-14">
                {/* Tab: Horários de Atendimento */}
                {activeTab === "horarios" && (
                    <div className="space-y-12">
                        <div className="flex flex-col gap-3">
                            <h3 className="font-display font-black text-3xl text-foreground uppercase tracking-tight">Expediente da IA</h3>
                            <p className="text-body font-medium max-w-xl">Defina em quais janelas a Raquel iniciará novas conversas para garantir que você esteja disponível para assumir.</p>
                        </div>

                        <div className="grid gap-6">
                            {days.map((day) => (
                                <div key={day.name} className="flex flex-wrap items-center justify-between gap-8 p-8 rounded-[32px] bg-muted/20 border border-transparent hover:border-border/50 transition-all group">
                                    <div className="flex items-center gap-8 min-w-[240px]">
                                        <Switch checked={day.active} className="data-[state=checked]:bg-primary" />
                                        <span className={cn("text-lg font-black uppercase tracking-tight transition-all", day.active ? "text-foreground" : "text-muted-foreground opacity-30")}>
                                            {day.name}
                                        </span>
                                    </div>

                                    {day.active ? (
                                        <div className="flex items-center gap-4 bg-card border border-border/50 p-2.5 rounded-2xl shadow-sm group-hover:shadow-md transition-all">
                                            <div className="px-8 py-3 rounded-xl bg-muted/40 font-black text-base text-foreground tracking-tighter">09:00</div>
                                            <span className="text-muted-foreground font-black opacity-10 text-xl">—</span>
                                            <div className="px-8 py-3 rounded-xl bg-muted/40 font-black text-base text-foreground tracking-tighter">18:00</div>
                                        </div>
                                    ) : (
                                        <div className="px-8 py-3 rounded-full bg-muted/10 border border-border/20 text-[10px] font-black uppercase tracking-widest opacity-40">Folga da IA</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-8">
                            <Button className="btn-primary h-16 px-10 font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all" asChild>
                                <Link href="/agenda/novo">
                                    <Plus className="h-5 w-5" /> Agendar Compromisso
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Tab: Notificações */}
                {activeTab === "notificacoes" && (
                    <div className="space-y-12">
                        <div className="flex flex-col gap-3">
                            <h3 className="font-display font-black text-3xl text-foreground uppercase tracking-tight">Fluxo de Alertas</h3>
                            <p className="text-body font-medium">Configure como quer ser avisado sobre o progresso dos seus leads.</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            {[
                                { title: "Relatório de Atendimento", desc: "Resumo diário por E-mail", checked: true },
                                { title: "Urgência (Hot Leads)", desc: "Alerta imediato via WhatsApp", checked: true },
                                { title: "Browser Push", desc: "Notificações na área de trabalho", checked: false },
                                { title: "Performance Semanal", desc: "Insights comparativos no Sábado", checked: true },
                            ].map((item) => (
                                <div key={item.title} className="p-10 rounded-[40px] bg-muted/20 border border-transparent hover:border-border/50 transition-all flex items-start justify-between cursor-pointer group shadow-sm hover:shadow-md">
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-black text-foreground uppercase tracking-tight">{item.title}</h4>
                                        <p className="text-sm font-bold text-muted-foreground opacity-60 leading-relaxed">{item.desc}</p>
                                    </div>
                                    <Switch checked={item.checked} className="data-[state=checked]:bg-accent" />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-8">
                            <Button
                                onClick={() => alert("Preferências salvas com sucesso!")}
                                className="btn-primary px-16 h-18 text-xs font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all bg-accent hover:bg-accent/90"
                            >
                                <Save className="w-5 h-5 mr-3" /> Salvar Preferências
                            </Button>
                        </div>
                    </div>
                )}

                {/* Tab: Dados Pessoais */}
                {activeTab === "dados" && (
                    <div className="space-y-16">
                        {/* Profile Design v2 */}
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                            <div className="relative group">
                                <div className="w-48 h-48 rounded-[64px] bg-gradient-to-br from-primary via-accent to-purple p-1.5 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <div className="w-full h-full rounded-[60px] bg-card flex items-center justify-center overflow-hidden border-8 border-card">
                                        <User className="w-24 h-24 text-muted-foreground opacity-10" />
                                    </div>
                                </div>
                                <Button
                                    size="icon"
                                    onClick={() => alert("Upload de foto: Em breve!")}
                                    className="absolute -bottom-4 -right-4 w-16 h-16 rounded-[24px] bg-foreground text-background shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-card"
                                >
                                    <Camera className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="flex-1 space-y-6 text-center lg:text-left">
                                <div className="space-y-2">
                                    <h3 className="font-display font-black text-5xl text-foreground uppercase tracking-tight leading-none">Jorge Martins</h3>
                                    <p className="text-body font-medium opacity-60">Consultor Imobiliário de Luxo</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Membro PRO</Badge>
                                    <Badge variant="outline" className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-border text-muted-foreground">ID: #45920-A</Badge>
                                </div>
                            </div>
                            <Button variant="ghost" className="rounded-2xl text-hot font-black uppercase tracking-widest text-[10px] h-14 px-10 border border-hot/10 hover:bg-hot/5 transition-all hover:scale-105 btn-interactive">
                                Sair da Conta
                            </Button>
                        </div>

                        <Separator className="bg-border opacity-30" />

                        {/* Advanced Form Grid */}
                        <div className="grid gap-12 md:grid-cols-2">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">Nome Profissional</label>
                                <Input defaultValue="Jorge Martins" className="h-18 bg-muted/20 border-border/50 rounded-3xl font-black text-lg p-8 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">WhatsApp para Notificações</label>
                                <Input defaultValue="(11) 98765-4321" className="h-18 bg-muted/20 border-border/50 rounded-3xl font-black text-lg p-8 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                                <p className="text-[9px] font-bold text-muted-foreground opacity-40 ml-4">*Onde você receberá os alertas de leads aquecidos.</p>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">E-mail Corporativo</label>
                                <Input defaultValue="jorge@imobiliaria.com" className="h-18 bg-muted/20 border-border/50 rounded-3xl font-black text-lg p-8 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">CRECI Ativo</label>
                                <Input defaultValue="123456-F" className="h-18 bg-muted/20 border-border/50 rounded-3xl font-black text-lg p-8 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                            </div>
                            <div className="space-y-4 md:col-span-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">Texto de Apresentação (IA)</label>
                                <textarea
                                    className="w-full min-h-[180px] bg-muted/20 border border-border/50 rounded-[40px] p-8 font-bold text-base focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all leading-relaxed"
                                    defaultValue="Corretor especializado em imóveis de luxo com mais de 10 anos de experiência..."
                                />
                                <p className="text-[10px] font-bold text-muted-foreground opacity-40 ml-4 italic">*Este texto auxilia a Raquel a entender seu perfil profissional ao falar com os leads.</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-end pt-12 gap-6">
                            <Button
                                variant="ghost"
                                onClick={() => alert("Um link de redefinição foi enviado para seu e-mail.")}
                                className="font-black uppercase tracking-widest text-[10px] h-18 px-12 rounded-3xl hover:bg-muted btn-interactive"
                            >
                                Redefinir Senha de Acesso
                            </Button>
                            <Button
                                onClick={() => alert("Perfil profissional atualizado!")}
                                className="btn-primary px-20 h-18 text-xs font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                            >
                                <Save className="w-5 h-5 mr-3" /> Salvar Perfil Profissional
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
