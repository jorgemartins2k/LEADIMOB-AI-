"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Building2, Rocket, Construction, CheckCircle2, Lock, MapPin, ChevronRight, Calendar, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getLaunches, deleteLaunch } from "@/lib/actions/launches";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function LaunchesPage() {
    const [activeTab, setActiveTab] = useState("todos");
    const [launches, setLaunches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Delete state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [launchToDelete, setLaunchToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const confirmDelete = (e: React.MouseEvent, id: string, name: string) => {
        e.preventDefault();
        e.stopPropagation();
        setLaunchToDelete({ id, name });
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!launchToDelete) return;
        setIsDeleting(true);
        try {
            const result = await deleteLaunch(launchToDelete.id);
            if (result.success) {
                toast.success(`Lançamento "${launchToDelete.name}" excluído com sucesso.`);
                setLaunches(prev => prev.filter(l => l.id !== launchToDelete.id));
                setIsDeleteDialogOpen(false);
            } else {
                toast.error("Erro ao excluir lançamento.");
            }
        } catch (error) {
            toast.error("Erro ao excluir lançamento.");
        } finally {
            setIsDeleting(false);
        }
    };

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
        <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000 pb-20 px-1 sm:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
                <div className="space-y-2">
                    <h1 className="heading-xl text-foreground">Novos <span className="text-gradient-accent">Lançamentos</span></h1>
                    <p className="text-body font-medium leading-relaxed">Gerencie unidades e materiais de venda dos seus empreendimentos em destaque.</p>
                </div>
                <Button className="btn-primary h-14 sm:h-16 px-8 sm:px-10 font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all w-full lg:w-auto" asChild>
                    <Link href="/lancamentos/novo">
                        <Plus className="h-5 w-5" /> Novo Lançamento
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
                {[
                    { label: "Total", value: launches.length },
                    { label: "Lançamentos", value: launches.filter(l => l.status === 'launch').length },
                    { label: "Em Obras", value: launches.filter(l => l.status === 'under_construction').length },
                    { label: "Pré", value: launches.filter(l => l.status === 'pre_launch').length },
                    { label: "Investindo", value: "8" },
                ].map((stat) => (
                    <div key={stat.label} className="card-premium p-4 sm:p-6 lg:p-8 flex flex-col gap-1.5 sm:gap-3">
                        <span className="text-[7px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest block opacity-60 line-clamp-1">{stat.label}</span>
                        <div className="text-xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tighter">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Search & Tabs */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-4 bg-muted/20 p-1.5 sm:p-2.5 rounded-[20px] sm:rounded-[32px] overflow-x-auto no-scrollbar border border-border/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-4 rounded-[14px] sm:rounded-[24px] font-black text-[8px] sm:text-[10px] uppercase tracking-widest transition-all whitespace-nowrap btn-interactive",
                                activeTab === tab.id
                                    ? "bg-foreground text-background shadow-xl"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {tab.icon && <tab.icon className="h-3.5 w-3.5 sm:h-4 w-4" />}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="card-premium p-1.5 sm:p-2 flex-1 flex items-center gap-2 sm:gap-3 bg-card border-border/40 shadow-sm focus-within:border-accent/40 transition-colors w-full">
                    <div className="p-2 sm:p-3 bg-muted/10 rounded-xl">
                        <Search className="w-3.5 h-3.5 sm:w-5 h-5 text-muted-foreground" />
                    </div>
                    <Input
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none h-10 sm:h-12 font-bold text-xs sm:text-base focus-visible:ring-0 placeholder:opacity-50"
                    />
                </div>
            </div>

            {/* Marketplace Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[360px] sm:h-[500px] rounded-[28px] sm:rounded-[48px] bg-muted/10 animate-pulse" />
                    ))}
                </div>
            ) : filteredLaunches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredLaunches.map((launch) => (
                        <Link key={launch.id} href={`/lancamentos/${launch.id}`} className="group h-full flex flex-col">
                            <div className="card-premium overflow-hidden flex flex-col h-full hover:border-accent/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/5">
                                {/* Image Container */}
                                <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden">
                                    <Image
                                        src={launch.photos?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop"}
                                        alt={launch.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 flex gap-1.5 sm:gap-2">
                                        <Badge className={cn("px-2.5 sm:px-4 py-0.5 sm:py-1.5 rounded-full text-[7px] sm:text-[9px] font-black uppercase tracking-widest border-none shadow-xl", statusMap[launch.status as keyof typeof statusMap]?.bg, statusMap[launch.status as keyof typeof statusMap]?.color)}>
                                            {statusMap[launch.status as keyof typeof statusMap]?.label}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => confirmDelete(e, launch.id, launch.name)}
                                            className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/95 text-destructive hover:bg-destructive hover:text-white transition-all shadow-xl"
                                        >
                                            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-2.5 sm:bottom-4 left-2.5 sm:left-4">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg border border-white/20">
                                            <Rocket className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 sm:p-8 space-y-4 sm:space-y-6 flex-1 flex flex-col">
                                    <div className="space-y-1 sm:space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="text-sm sm:text-lg lg:text-xl font-black tracking-tight text-foreground group-hover:text-accent transition-colors line-clamp-1">
                                                {launch.name}
                                            </h3>
                                            <ChevronRight className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1 shrink-0" />
                                        </div>
                                        <p className="flex items-center gap-1 text-[8px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                                            <MapPin className="h-2 w-2 sm:h-2.5 sm:w-2.5" /> {launch.neighborhood}, {launch.city}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between border-y border-border/40 py-3 sm:py-5">
                                        <div className="flex flex-col gap-0.5 sm:gap-1">
                                            <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Incorporadora</span>
                                            <p className="text-[10px] sm:text-sm font-black truncate max-w-[80px] sm:max-w-[120px]">
                                                {launch.developer || "Premium"}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-0.5 sm:gap-1 items-end text-right">
                                            <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Entrega</span>
                                            <p className="text-[10px] sm:text-sm font-black flex items-center gap-1 sm:gap-1.5">
                                                <Calendar className="h-2 w-2 sm:h-3 sm:w-3 text-accent" /> {launch.deliveryDate ? new Date(launch.deliveryDate).toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' }) : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 sm:pt-4 flex justify-between items-end mt-auto gap-2">
                                        <div className="space-y-0.5 sm:space-y-1">
                                            <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] text-accent">Tabela de Lançamento</p>
                                            <p className="text-lg sm:text-2xl font-black text-foreground tracking-tighter">
                                                R$ {Number(launch.priceFrom).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="rounded-full border-border/50 text-[7px] sm:text-[9px] font-black px-1.5 sm:px-3 py-0.5 sm:py-1 uppercase tracking-widest shrink-0">
                                            {launch.standard}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 sm:py-32 rounded-[32px] sm:rounded-[56px] border-4 border-dashed border-muted/50 bg-muted/5 group hover:border-accent/30 transition-all duration-700 relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 px-6">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[20px] sm:rounded-3xl bg-muted/30 flex items-center justify-center mb-6 sm:mb-10 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                            <Building2 className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground opacity-30" />
                        </div>
                        <h3 className="text-xl sm:text-3xl font-black text-foreground uppercase tracking-tight mb-3 sm:mb-4">Nenhum lançamento</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground font-bold max-w-sm mx-auto mb-8 sm:mb-12 opacity-60 leading-relaxed">
                            Sua vitrine de lançamentos está vazia. Adicione novas oportunidades para a <span className="text-foreground">Raquel</span> prospectar investidores.
                        </p>
                        <Button className="btn-primary w-full sm:w-auto px-10 sm:px-12 h-14 sm:h-16 rounded-[20px] sm:rounded-[24px] shadow-2xl transition-all font-black uppercase text-[10px] tracking-widest bg-accent hover:bg-accent/90" asChild>
                            <Link href="/lancamentos/novo">
                                <Plus className="h-5 w-5 mr-3" /> Adicionar Primeiro
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
            {/* Modal de Exclusão Premium */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-transparent shadow-2xl">
                    <div className="relative bg-card/95 backdrop-blur-2xl border border-white/10 rounded-[32px] sm:rounded-[40px] overflow-hidden p-8 sm:p-10 animate-in zoom-in duration-300">
                        {/* Background Decoration */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-destructive/10 blur-[80px] rounded-full" />

                        <div className="relative z-10 space-y-6 sm:space-y-8">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto shadow-inner border border-destructive/20 rotate-3 transition-transform">
                                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-destructive animate-pulse" />
                            </div>

                            <div className="space-y-3 text-center">
                                <DialogTitle className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tighter leading-none">
                                    Remover Lançamento
                                </DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                                    Deseja remover <span className="text-foreground font-black italic">"{launchToDelete?.name}"</span>? Esta ação não pode ser desfeita.
                                </DialogDescription>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                    className="h-14 sm:h-16 rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] text-muted-foreground hover:bg-muted/50"
                                >
                                    Voltar
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="h-14 sm:h-16 rounded-2xl bg-destructive text-white font-black uppercase tracking-widest text-[9px] sm:text-[10px] shadow-lg shadow-destructive/20 hover:scale-105 active:scale-95 transition-all gap-2"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    Excluir
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
