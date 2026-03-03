"use client";

import { useState } from "react";
import { User, Bell, Clock, Save, Camera, Smartphone, Mail, Globe, Hash, Info, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="heading-hero text-foreground">Configurações</h1>
                <p className="text-body text-lg text-muted-foreground">Gerencie suas preferências e dados da conta.</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-[28px] w-fit overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-foreground text-background shadow-lg"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab: Horários de Atendimento */}
            {activeTab === "horarios" && (
                <div className="bg-card border border-border rounded-[48px] p-12 shadow-soft space-y-10">
                    <div className="flex flex-col gap-2">
                        <h3 className="font-display font-black text-2xl text-foreground uppercase tracking-tight">Expediente</h3>
                        <p className="text-sm font-bold text-muted-foreground">Defina os horários em que você está disponível para atendimento.</p>
                    </div>

                    <div className="space-y-6">
                        {days.map((day) => (
                            <div key={day.name} className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-[32px] bg-muted/10 border border-transparent hover:border-border transition-all group">
                                <div className="flex items-center gap-6 min-w-[200px]">
                                    <Switch checked={day.active} />
                                    <span className={cn("text-base font-black uppercase tracking-tight", day.active ? "text-foreground" : "text-muted-foreground opacity-50")}>
                                        {day.name}
                                    </span>
                                </div>

                                {day.active ? (
                                    <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-2xl shadow-sm">
                                        <div className="px-6 py-2 rounded-xl bg-muted/30 font-black text-sm text-foreground">09:00</div>
                                        <span className="text-muted-foreground font-black opacity-20">—</span>
                                        <div className="px-6 py-2 rounded-xl bg-muted/30 font-black text-sm text-foreground">18:00</div>
                                    </div>
                                ) : (
                                    <Badge variant="outline" className="px-6 py-2 rounded-full border-muted text-[10px] font-black uppercase tracking-widest opacity-40">Fechado</Badge>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-6">
                        <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-12 h-16 rounded-[24px] shadow-primary/20 shadow-xl transition-all">
                            <Save className="w-5 h-5 mr-3" /> Salvar Alterações
                        </Button>
                    </div>
                </div>
            )}

            {/* Tab: Notificações */}
            {activeTab === "notificacoes" && (
                <div className="bg-card border border-border rounded-[48px] p-12 shadow-soft space-y-10">
                    <div className="flex flex-col gap-2">
                        <h3 className="font-display font-black text-2xl text-foreground uppercase tracking-tight">Preferências de Notificação</h3>
                        <p className="text-sm font-bold text-muted-foreground">Escolha como você quer ser avisado sobre novos leads e atividades.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {[
                            { title: "Email", desc: "Novos leads e relatórios diários", checked: true },
                            { title: "WhatsApp", desc: "Alertas urgentes de novos contatos", checked: true },
                            { title: "Push (App)", desc: "Notificações em tempo real no navegador", checked: false },
                            { title: "Relatório Semanal", desc: "Resumo de desempenho por email", checked: true },
                        ].map((item) => (
                            <div key={item.title} className="p-8 rounded-[40px] bg-muted/10 border border-transparent hover:border-border transition-all flex items-start justify-between cursor-pointer group">
                                <div className="space-y-1">
                                    <h4 className="text-base font-black text-foreground uppercase tracking-tight">{item.title}</h4>
                                    <p className="text-xs font-bold text-muted-foreground">{item.desc}</p>
                                </div>
                                <Switch checked={item.checked} />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-6">
                        <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-12 h-16 rounded-[24px] shadow-primary/20 shadow-xl transition-all">
                            <Save className="w-5 h-5 mr-3" /> Salvar Preferências
                        </Button>
                    </div>
                </div>
            )}

            {/* Tab: Dados Pessoais */}
            {activeTab === "dados" && (
                <div className="bg-card border border-border rounded-[48px] p-12 shadow-soft space-y-12">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-[56px] bg-gradient-to-br from-primary to-accent p-1">
                                <div className="w-full h-full rounded-[55px] bg-card flex items-center justify-center overflow-hidden border-4 border-card">
                                    <User className="w-20 h-20 text-muted-foreground opacity-20" />
                                </div>
                            </div>
                            <Button size="icon" className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-foreground text-background shadow-xl hover:scale-110 transition-transform">
                                <Camera className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <h3 className="font-display font-black text-3xl text-foreground uppercase tracking-tight">Jorge Martins</h3>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <Badge variant="secondary" className="bg-muted px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Plano Pro</Badge>
                                <span className="text-xs font-bold text-muted-foreground">ID: #45920</span>
                            </div>
                        </div>
                        <Button variant="outline" className="rounded-2xl border-hot/20 text-hot font-black uppercase tracking-widest text-[10px] h-12 px-8 hover:bg-hot/5 transition-all">
                            Sair da Conta
                        </Button>
                    </div>

                    <Separator className="bg-border opacity-50" />

                    {/* Form Grid */}
                    <div className="grid gap-10 md:grid-cols-2">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Nome Completo</label>
                            <Input defaultValue="Jorge Martins" className="h-16 bg-muted/20 border-border rounded-2xl font-bold focus-visible:ring-primary/20" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">WhatsApp</label>
                            <Input defaultValue="(11) 98765-4321" className="h-16 bg-muted/20 border-border rounded-2xl font-bold focus-visible:ring-primary/20" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">E-mail</label>
                            <Input defaultValue="jorge@imobiliaria.com" className="h-16 bg-muted/20 border-border rounded-2xl font-bold focus-visible:ring-primary/20" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">CRECI / Registro</label>
                            <Input defaultValue="123456-F" className="h-16 bg-muted/20 border-border rounded-2xl font-bold focus-visible:ring-primary/20" />
                        </div>
                        <div className="space-y-4 md:col-span-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Bio / Descrição Profissional</label>
                            <textarea
                                className="w-full min-h-[150px] bg-muted/20 border border-border rounded-[32px] p-6 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                defaultValue="Corretor especializado em imóveis de luxo com mais de 10 anos de experiência..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 gap-6">
                        <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] h-16 px-10 rounded-2xl hover:bg-muted transition-all">
                            Redefinir Senha
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-12 h-16 rounded-[24px] shadow-primary/20 shadow-xl transition-all">
                            <Save className="w-5 h-5 mr-3" /> Salvar Perfil
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
