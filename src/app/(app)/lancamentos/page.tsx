"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Building2, Rocket, Construction, CheckCircle2, Lock, MapPin, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getLaunches } from "@/lib/actions/launches";

export default function LaunchesPage() {
    const [activeTab, setActiveTab] = useState("todos");
    const [launches, setLaunches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchLaunches = async () => {
            try {
                const data = await getLaunches();
                setLaunches(data);
            } catch (error) {
                console.error("Error fetching launches:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLaunches();
    }, []);

    const tabs = [
        { id: "todos", label: "Todos" },
        { id: "pre_launch", label: "Pré-Lançamento", icon: Rocket },
        { id: "launch", label: "Em Lançamento", icon: Rocket },
        { id: "under_construction", label: "Em Construção", icon: Construction },
    ];

    const filteredLaunches = launches.filter(l => {
        const matchesSearch =
            l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.developer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === "todos" || l.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const statusMap = {
        pre_launch: { label: "Pré", icon: Rocket, color: "text-blue-500", bg: "bg-blue-500/10" },
        launch: { label: "Agora", icon: Rocket, color: "text-accent", bg: "bg-accent/10" },
        under_construction: { label: "Obras", icon: Construction, color: "text-purple-500", bg: "bg-purple-500/10" },
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="heading-xl text-foreground">Novos <span className="text-gradient-accent">Lançamentos</span></h1>
                    <p className="text-body font-medium leading-relaxed">Gerencie unidades e materiais de venda dos seus empreendimentos em destaque.</p>
                </div>
                <Button className="btn-primary h-16 px-10 font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all" asChild>
                    <Link href="/lancamentos/novo">
                        <Plus className="h-5 w-5" /> Novo Lançamento
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: "Total", value: launches.length },
                    { label: "Lançamentos", value: launches.filter(l => l.status === 'launch').length },
                    { label: "Em Obras", value: launches.filter(l => l.status === 'under_construction').length },
                    { label: "Pré", value: launches.filter(l => l.status === 'pre_launch').length },
                    { label: "Investindo", value: "8" },
                ].map((stat) => (
                    <div key={stat.label} className="card-premium p-8 flex flex-col gap-3">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">{stat.label}</span>
                        <div className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Search & Tabs */}
            <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="flex items-center gap-4 bg-muted/20 p-2.5 rounded-[32px] overflow-x-auto no-scrollbar border border-border/50 w-full lg:w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-3 px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap btn-interactive",
                                activeTab === tab.id
                                    ? "bg-foreground text-background shadow-2xl shadow-black/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {tab.icon && <tab.icon className="h-4 w-4" />}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="card-premium p-4 flex-1 flex items-center gap-4 bg-muted/20 w-full">
                    <Search className="w-5 h-5 text-muted-foreground ml-2" />
                    <Input
                        placeholder="Buscar por nome do empreendimento..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none h-10 font-bold focus-visible:ring-0 placeholder:opacity-50"
                    />
                </div>
            </div>

            {/* Marketplace Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[500px] rounded-[48px] bg-muted/10 animate-pulse" />
                    ))}
                </div>
            ) : filteredLaunches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredLaunches.map((launch) => (
                        <Link key={launch.id} href={`/lancamentos/${launch.id}`} className="group h-full flex flex-col">
                            <div className="card-premium overflow-hidden flex flex-col h-full hover:border-accent/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/5">
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                    <Image
                                        src={launch.photos?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop"}
                                        alt={launch.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-xl", statusMap[launch.status as keyof typeof statusMap]?.bg, statusMap[launch.status as keyof typeof statusMap]?.color)}>
                                            {statusMap[launch.status as keyof typeof statusMap]?.label}
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg border border-white/20">
                                            <Rocket className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 space-y-6 flex-1 flex flex-col">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors line-clamp-1">
                                                {launch.name}
                                            </h3>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1" />
                                        </div>
                                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium italic opacity-70">
                                            <MapPin className="h-3 w-3" /> {launch.neighborhood}, {launch.city}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between border-y border-border/50 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Incorporadora</span>
                                            <p className="text-sm font-bold truncate max-w-[120px]">
                                                {launch.developer || "Premium"}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end text-right">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Entrega</span>
                                            <p className="text-sm font-bold flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3 text-accent" /> {launch.deliveryDate ? new Date(launch.deliveryDate).toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }) : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex justify-between items-end mt-auto">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-accent">A partir de</p>
                                            <p className="text-2xl font-black text-foreground tracking-tighter">
                                                R$ {Number(launch.priceFrom).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="rounded-full border-border/50 text-[9px] font-bold px-3">
                                            {launch.standard}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 rounded-[56px] border-4 border-dashed border-muted/50 bg-muted/5 group hover:border-accent/30 transition-all duration-700 relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="w-24 h-24 rounded-3xl bg-muted/30 flex items-center justify-center mb-10 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                            <Building2 className="h-12 w-12 text-muted-foreground opacity-30" />
                        </div>
                        <h3 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4">Nenhum lançamento ativo</h3>
                        <p className="text-muted-foreground font-bold max-w-sm mx-auto mb-12 opacity-60 leading-relaxed">
                            Sua vitrine de lançamentos está vazia. Adicione novas oportunidades para a <span className="text-foreground">Raquel</span> prospectar investidores.
                        </p>
                        <Button className="btn-primary px-12 h-16 rounded-[24px] shadow-2xl transition-all font-black uppercase text-[10px] tracking-widest bg-accent hover:bg-accent/90" asChild>
                            <Link href="/lancamentos/novo">
                                <Plus className="h-5 w-5 mr-3" /> Cadastrar Novo Lançamento
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
