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
    Share2,
    Trash2,
    Plus,
    Loader2
} from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
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
import { getCampaigns, createCampaign, deleteCampaign } from '@/lib/actions/campaigns';

export function CampaignsView() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [copiedLink, setCopiedLink] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form states
    const [newTitle, setNewTitle] = useState("");
    const [newType, setNewType] = useState("instagram_feed");

    useEffect(() => {
        loadCampaigns();
    }, []);

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

    const handleCopy = (link: string, id: string) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(id);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    const handleCreate = async () => {
        if (!newTitle) return;
        setIsCreating(true);
        try {
            const result = await createCampaign({
                title: newTitle,
                contentType: newType
            });
            if (result.error) {
                toast.error(result.error, { duration: 3000 });
            } else {
                toast.success("Campanha criada com sucesso! 🚀", { duration: 3000 });
                setIsModalOpen(false);
                setNewTitle("");
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
        if (!confirm("Tem certeza que deseja excluir esta campanha?")) return;
        try {
            const result = await deleteCampaign(id);
            if (result.error) {
                toast.error(result.error, { duration: 3000 });
            } else {
                toast.success("Campanha excluída.", { duration: 3000 });
                loadCampaigns();
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir campanha.", { duration: 3000 });
        }
    };

    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'stories': return { icon: Smartphone, color: 'text-pink-500', bg: 'bg-pink-500/10' };
            case 'instagram_feed': return { icon: Camera, color: 'text-purple-500', bg: 'bg-purple-500/10' };
            default: return { icon: Share2, color: 'text-primary', bg: 'bg-primary/10' };
        }
    };

    const stats = [
        { label: 'Campanhas Ativas', value: campaigns.length.toString(), color: 'text-foreground' },
        { label: 'Cliques Totais', value: campaigns.reduce((acc, c) => acc + (c.totalClicks || 0), 0).toString(), color: 'text-primary' },
        { label: 'Leads Gerados', value: campaigns.reduce((acc, c) => acc + (c.totalLeads || 0), 0).toString(), color: 'text-success' },
        { label: 'Conversões', value: '0%', color: 'text-accent' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="heading-xl text-foreground">Campanhas <span className="text-gradient-accent">Inteligentes</span></h1>
                    <p className="text-body font-normal leading-relaxed">Links rastreáveis que conectam seus anúncios diretamente à <span className="text-foreground font-semibold">Raquel</span>.</p>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary h-16 px-10 font-semibold uppercase text-[10px] tracking-wider gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <Rocket className="w-5 h-5" /> Nova Campanha
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border sm:max-w-[425px] rounded-[32px]">
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
                                    className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest ml-2">Plataforma / Formato</Label>
                                <Select value={newType} onValueChange={setNewType}>
                                    <SelectTrigger className="bg-muted/20 border-border/50 h-14 rounded-2xl px-6 font-medium">
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
                        </div>
                        <DialogFooter className="pt-4">
                            <Button
                                onClick={handleCreate}
                                disabled={isCreating || !newTitle}
                                className="w-full h-16 rounded-2xl bg-foreground text-background font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                Criar Campanha Real
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="card-premium p-8 flex flex-col gap-3">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        <p className={cn("text-4xl font-bold tracking-tighter", stat.color)}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Tutorial / Insight */}
            <div className="card-premium p-10 bg-accent/5 border-accent/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-3xl rounded-full -z-10 group-hover:bg-accent/20 transition-all" />

                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                    <div className="w-20 h-20 rounded-3xl bg-accent text-white flex items-center justify-center shrink-0 shadow-lg shadow-accent/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                        <Lightbulb className="w-10 h-10" />
                    </div>
                    <div className="space-y-4 flex-1">
                        <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Otimize seu Investimento em Tráfego</h3>
                        <p className="text-muted-foreground font-normal leading-relaxed max-w-2xl">
                            Use links únicos para cada plataforma (Instagram, Facebook, Google) e descubra exatamente de onde vêm seus clientes mais lucrativos. A <span className="text-foreground font-semibold">Raquel</span> identifica a origem e adapta a abordagem.
                        </p>
                    </div>
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-accent/20 text-accent font-semibold uppercase text-[10px] tracking-wider btn-interactive">
                        Ver Tutorial Completo
                    </Button>
                </div>
            </div>

            {/* Campaigns Grid */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        Campanhas Rodando
                    </h3>
                    <Button
                        onClick={loadCampaigns}
                        variant="ghost"
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                    >
                        Atualizar Lista
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Carregando campanhas...</p>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="card-premium p-20 flex flex-col items-center justify-center gap-6 border-dashed opacity-60">
                        <Megaphone className="w-16 h-16 text-muted-foreground opacity-20" />
                        <div className="text-center space-y-2">
                            <p className="text-lg font-black text-foreground uppercase tracking-tight">Nenhuma campanha ativa</p>
                            <p className="text-sm font-medium text-muted-foreground">Clique em "Nova Campanha" para começar a rastrear seus leads.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {campaigns.map((camp) => {
                            const style = getTypeStyle(camp.contentType);
                            return (
                                <div key={camp.id} className="card-premium p-8 hover:border-primary/40 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform", style.bg)}>
                                            <style.icon className={cn("w-8 h-8", style.color)} />
                                        </div>

                                        <div className="flex-1 space-y-5">
                                            <div className="flex items-center gap-4">
                                                <h4 className="text-2xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">{camp.title}</h4>
                                                <span className="bg-success/10 text-success text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-success/20">Ativa</span>
                                            </div>

                                            <div className="flex items-center gap-3 bg-muted/20 p-2.5 rounded-2xl group-hover:bg-muted/40 transition-colors border border-border/50">
                                                <code className="text-[11px] font-semibold text-muted-foreground truncate flex-1 px-4">{camp.trackingLink}</code>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleCopy(camp.trackingLink, camp.id)}
                                                    className={cn(
                                                        "rounded-xl h-11 px-8 font-semibold text-[10px] uppercase tracking-wider transition-all shadow-lg",
                                                        copiedLink === camp.id ? "bg-success hover:bg-success scale-105" : "bg-primary hover:scale-105 active:scale-95"
                                                    )}
                                                >
                                                    {copiedLink === camp.id ? <Check className="w-5 h-5" /> : <><Copy className="w-4 h-4 mr-2" /> Copiar Link</>}
                                                </Button>
                                            </div>

                                            <div className="flex flex-wrap gap-10 pt-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-muted/30 rounded-xl">
                                                        <Eye className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-black text-foreground leading-none">{camp.totalClicks || 0}</span>
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Cliques</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-primary/10 rounded-xl">
                                                        <Users className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-black text-foreground leading-none">{camp.totalLeads || 0}</span>
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Leads</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-accent/10 rounded-xl">
                                                        <Target className="w-5 h-5 text-accent" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-black text-foreground leading-none">{camp.totalConversions || 0}</span>
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Visitas</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl hover:bg-muted btn-interactive border border-transparent hover:border-border/50">
                                                <Share2 className="w-5 h-5 text-muted-foreground" />
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(camp.id)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-14 w-14 rounded-2xl hover:bg-hot/10 hover:text-hot btn-interactive border border-transparent hover:border-hot/20"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
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
