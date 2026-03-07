'use client';

import { useState, useEffect } from 'react';
import {
    Megaphone,
    Rocket,
    Lightbulb,
    Eye,
    Users,
    Target,
    Copy,
    Check,
    Smartphone,
    Camera,
    Film,
    Play,
    Trash2,
    Plus,
    Loader2,
    Home,
    Globe,
    Search
} from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getCampaigns, createCampaign, deleteCampaign } from '@/lib/actions/campaigns';
import { getProperties } from '@/lib/actions/properties';
import { getLaunches } from '@/lib/actions/launches';

export function CampaignsView() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form states
    const [newTitle, setNewTitle] = useState("");
    const [newType, setNewType] = useState("instagram_feed");
    const [linkType, setLinkType] = useState<"none" | "property" | "launch">("none");
    const [linkId, setLinkId] = useState<string>("");

    const [availableProperties, setAvailableProperties] = useState<any[]>([]);
    const [availableLaunches, setAvailableLaunches] = useState<any[]>([]);

    useEffect(() => {
        loadCampaigns();
        loadLinkables();
    }, []);

    async function loadLinkables() {
        try {
            const [p, l] = await Promise.all([getProperties(), getLaunches()]);
            setAvailableProperties(p);
            setAvailableLaunches(l);
        } catch (error) {
            console.error("Error loading linkables:", error);
        }
    }

    async function loadCampaigns() {
        setIsLoading(true);
        try {
            const data = await getCampaigns();
            setCampaigns(data);
        } catch (error) {
            console.error("Error loading campaigns:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleCopy = (slug: string) => {
        const link = `${window.location.origin}/c/${slug}`;
        navigator.clipboard.writeText(link);
        setCopiedLink(slug);
        toast.success("Link copiado com sucesso! 🚀", { duration: 2000 });
        setTimeout(() => setCopiedLink(null), 2000);
    };

    const handleCreate = async () => {
        if (!newTitle) return;
        setIsCreating(true);
        try {
            const result = await createCampaign({
                title: newTitle,
                contentType: newType,
                propertyId: linkType === "property" ? linkId : null,
                launchId: linkType === "launch" ? linkId : null,
                baseUrl: window.location.origin
            });
            if (result.error) {
                toast.error(result.error, { duration: 3000 });
            } else {
                toast.success("Campanha criada com sucesso! 🚀", { duration: 3000 });
                setIsModalOpen(false);
                setNewTitle("");
                setLinkType("none");
                setLinkId("");
                loadCampaigns();
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao criar campanha.", { duration: 3000 });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteCampaign(id);
            if (result.error) {
                toast.error(result.error, { duration: 3000 });
            } else {
                toast.success("Campanha excluída com sucesso.", { duration: 3000 });
                loadCampaigns();
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir campanha.", { duration: 3000 });
        }
    };

    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'stories': return { icon: Play, color: 'text-pink-500', bg: 'bg-pink-500/10' };
            case 'instagram_feed': return { icon: Camera, color: 'text-purple-500', bg: 'bg-purple-500/10' };
            case 'facebook': return { icon: Globe, color: 'text-blue-600', bg: 'bg-blue-600/10' };
            case 'google': return { icon: Search, color: 'text-orange-500', bg: 'bg-orange-500/10' };
            default: return { icon: Rocket, color: 'text-primary', bg: 'bg-primary/10' };
        }
    };

    const stats = [
        { label: 'Campanhas Ativas', value: campaigns.length.toString(), color: 'text-foreground' },
        { label: 'Cliques Totais', value: campaigns.reduce((acc, c) => acc + (c.totalClicks || 0), 0).toString(), color: 'text-primary' },
        { label: 'Leads Gerados', value: campaigns.reduce((acc, c) => acc + (c.totalLeads || 0), 0).toString(), color: 'text-success' },
        { label: 'Conversões', value: '0%', color: 'text-accent' },
    ];

    return (
        <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-1000 pb-20 px-1 sm:px-0">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2 sm:space-y-3">
                    <h1 className="heading-xl text-foreground">Campanhas <span className="text-gradient-accent">Inteligentes</span></h1>
                    <p className="text-body font-medium leading-relaxed">Links rastreáveis que conectam seus anúncios diretamente à <span className="text-foreground font-black">Raquel</span>.</p>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary h-14 sm:h-16 px-8 sm:px-10 font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all w-full lg:w-auto">
                            <Rocket className="w-5 h-5" /> Nova Campanha
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card/95 backdrop-blur-xl border-border sm:max-w-[425px] rounded-[32px] p-6 sm:p-8">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight">Criar Nova Campanha</DialogTitle>
                            <DialogDescription className="text-muted-foreground font-medium">
                                Configure o link de rastreio para seu novo anúncio.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest ml-2">Título da Campanha</Label>
                                <Input
                                    id="title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Ex: Campanha Instagram Lançamento"
                                    className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest ml-2">Plataforma / Formato</Label>
                                <Select value={newType} onValueChange={setNewType}>
                                    <SelectTrigger className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-bold text-sm">
                                        <SelectValue placeholder="Selecione o formato" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="instagram_feed">Feed do Instagram</SelectItem>
                                        <SelectItem value="stories">Instagram Stories</SelectItem>
                                        <SelectItem value="facebook">Facebook Ads</SelectItem>
                                        <SelectItem value="google">Google Ads</SelectItem>
                                        <SelectItem value="outro">Outro / Geral</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="linkType" className="text-[10px] font-black uppercase tracking-widest ml-2">Vincular a:</Label>
                                <Select value={linkType} onValueChange={(v: any) => { setLinkType(v); setLinkId(""); }}>
                                    <SelectTrigger className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-bold text-sm">
                                        <SelectValue placeholder="Selecione o tipo de vínculo" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="none">Nenhum / Geral</SelectItem>
                                        <SelectItem value="property">Imóvel</SelectItem>
                                        <SelectItem value="launch">Lançamento</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {linkType !== "none" && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <Label htmlFor="linkId" className="text-[10px] font-black uppercase tracking-widest ml-2">
                                        {linkType === "property" ? "Selecione o Imóvel" : "Selecione o Lançamento"}
                                    </Label>
                                    <Select value={linkId} onValueChange={setLinkId}>
                                        <SelectTrigger className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-bold text-sm">
                                            <SelectValue placeholder={`Escolha um ${linkType === "property" ? "imóvel" : "lançamento"}`} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            {linkType === "property" ? (
                                                availableProperties.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                                ))
                                            ) : (
                                                availableLaunches.map(l => (
                                                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="pt-4">
                            <Button
                                onClick={handleCreate}
                                disabled={isCreating || !newTitle}
                                className="w-full h-16 rounded-2xl bg-foreground text-background font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                Criar Campanha Agora
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="card-premium p-6 sm:p-8 flex flex-col gap-2 sm:gap-3">
                        <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        <p className={cn("text-3xl sm:text-4xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Tutorial / Insight */}
            <div className="card-premium p-6 sm:p-10 bg-accent/5 border-accent/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-3xl rounded-full -z-10 group-hover:bg-accent/20 transition-all opacity-50 sm:opacity-100" />

                <div className="relative z-10 flex flex-col md:flex-row gap-6 sm:gap-10 items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-accent text-white flex items-center justify-center shrink-0 shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
                        <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                    <div className="space-y-3 sm:space-y-4 flex-1 text-center md:text-left">
                        <h3 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">Otimize seu Investimento em Tráfego</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl">
                            Use links únicos para cada plataforma e descubra exatamente de onde vêm seus clientes mais lucrativos. A <span className="text-foreground font-black">Raquel</span> identifica a origem e adapta a abordagem.
                        </p>
                    </div>
                    <Button variant="outline" className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl border-accent/20 text-accent font-black uppercase text-[10px] tracking-widest btn-interactive w-full md:w-auto">
                        Ver Tutorial
                    </Button>
                </div>
            </div>

            {/* Campaigns Grid */}
            <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-3">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        Campanhas Rodando
                    </h3>
                    <Button
                        onClick={loadCampaigns}
                        variant="ghost"
                        className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground h-10 px-4"
                    >
                        Atualizar
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Carregando...</p>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="card-premium p-12 sm:p-20 flex flex-col items-center justify-center gap-6 border-dashed opacity-60">
                        <Megaphone className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground opacity-20" />
                        <div className="text-center space-y-2">
                            <p className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">Nenhuma campanha</p>
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Crie sua primeira campanha para rastrear leads.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:gap-6">
                        {campaigns.map((camp) => {
                            const style = getTypeStyle(camp.contentType);
                            return (
                                <div key={camp.id} className="card-premium p-6 sm:p-8 hover:border-primary/40 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start lg:items-center">
                                        <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform", style.bg)}>
                                            <style.icon className={cn("w-6 h-6 sm:w-8 h-8", style.color)} />
                                        </div>

                                        <div className="flex-1 space-y-4 sm:space-y-5 w-full">
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                                <h4 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-none">{camp.title}</h4>
                                                <span className="bg-success/10 text-success text-[8px] sm:text-[9px] font-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-widest border border-success/20">Ativa</span>
                                                {camp.property && (
                                                    <Badge variant="outline" className="rounded-full text-[8px] font-black px-3 py-1 border-primary/30 text-primary">
                                                        <Home className="w-3 h-3 mr-1" /> {camp.property.title}
                                                    </Badge>
                                                )}
                                                {camp.launch && (
                                                    <Badge variant="outline" className="rounded-full text-[8px] font-black px-3 py-1 border-accent/30 text-accent">
                                                        <Rocket className="w-3 h-3 mr-1" /> {camp.launch.name}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-muted/20 p-2 rounded-2xl group-hover:bg-muted/40 transition-colors border border-border/50">
                                                <div className="text-[10px] sm:text-[11px] font-bold text-muted-foreground truncate flex-1 px-4 py-2 sm:py-0">
                                                    {typeof window !== 'undefined' ? `${window.location.origin}/c/${camp.slug}` : camp.trackingLink}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleCopy(camp.slug)}
                                                    className={cn(
                                                        "rounded-xl h-10 sm:h-11 px-6 sm:px-8 font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all shadow-lg",
                                                        copiedLink === camp.slug ? "bg-success hover:bg-success scale-105" : "bg-primary hover:scale-105 active:scale-95"
                                                    )}
                                                >
                                                    {copiedLink === camp.slug ? <Check className="w-4 h-4" /> : <><Copy className="w-3.5 h-3.5 mr-2" /> Copiar Link</>}
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 sm:gap-10 pt-2 border-t border-border/10">
                                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
                                                    <div className="p-2 sm:p-2.5 bg-muted/30 rounded-lg sm:rounded-xl hidden xs:block">
                                                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                                                        <span className="text-base sm:text-lg font-black text-foreground leading-none">{camp.totalClicks || 0}</span>
                                                        <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Cliques</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 border-l border-border/10 sm:border-none pl-4 sm:pl-0">
                                                    <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg sm:rounded-xl hidden xs:block">
                                                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                                                        <span className="text-base sm:text-lg font-black text-foreground leading-none">{camp.totalLeads || 0}</span>
                                                        <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Leads</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 border-l border-border/10 sm:border-none pl-4 sm:pl-0">
                                                    <div className="p-2 sm:p-2.5 bg-accent/10 rounded-lg sm:rounded-xl hidden xs:block">
                                                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                                                    </div>
                                                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                                                        <span className="text-base sm:text-lg font-black text-foreground leading-none">{camp.totalConversions || 0}</span>
                                                        <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Visitas</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex sm:flex-col lg:flex-row gap-2 sm:gap-3 w-full lg:w-auto border-t border-border/10 lg:border-none pt-4 lg:pt-0">
                                            {/* EXTREMELY IMPORTANT: Action row only contains Delete button. NO SHARE BUTTON ALLOWED. */}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl hover:bg-hot/10 hover:text-hot btn-interactive border border-border/30 lg:border-transparent flex-1 lg:flex-none"
                                                    >
                                                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-[32px] border-border/50 bg-card p-8">
                                                    <AlertDialogHeader className="space-y-4">
                                                        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                                                            <Trash2 className="h-8 w-8" />
                                                        </div>
                                                        <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Excluir Campanha?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-muted-foreground font-medium">
                                                            Esta ação não pode ser desfeita. A campanha <span className="text-foreground font-black">"{camp.title}"</span> será removida permanentemente.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="mt-8 gap-3">
                                                        <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-border/50 bg-muted/10">Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(camp.id)}
                                                            className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-destructive text-white hover:bg-destructive/90 transition-all active:scale-95"
                                                        >
                                                            Confirmar Exclusão
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
