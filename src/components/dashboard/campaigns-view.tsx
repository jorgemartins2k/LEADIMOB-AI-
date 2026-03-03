'use client';

import { useState } from 'react';
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
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function CampaignsView() {
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    const stats = [
        { label: 'Campanhas Ativas', value: '4', color: 'text-foreground' },
        { label: 'Cliques Totais', value: '1.240', color: 'text-primary' },
        { label: 'Leads Gerados', value: '86', color: 'text-success' },
        { label: 'Conversões', value: '12%', color: 'text-accent' },
    ];

    const campaigns = [
        {
            id: '1',
            title: 'Stories Edifício Aurora',
            type: 'stories',
            link: 'https://leadimob.ai/c/aurora-sh',
            clicks: 450,
            leads: 32,
            conversions: 5,
            status: 'active'
        },
        {
            id: '2',
            title: 'Feed Lançamento Garden',
            type: 'instagram_feed',
            link: 'https://leadimob.ai/c/garden-f',
            clicks: 790,
            leads: 54,
            conversions: 7,
            status: 'active'
        }
    ];

    const handleCopy = (link: string, id: string) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(id);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'stories': return { icon: Smartphone, color: 'text-pink-500', bg: 'bg-pink-500/10' };
            case 'instagram_feed': return { icon: Camera, color: 'text-purple-500', bg: 'bg-purple-500/10' };
            default: return { icon: Share2, color: 'text-primary', bg: 'bg-primary/10' };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-xl text-foreground">Campanhas Inteligentes</h1>
                    <p className="text-body mt-1">Crie links rastreáveis e descubra quais canais trazem os melhores leads.</p>
                </div>
                <Button className="btn-primary h-12 px-8 font-bold uppercase text-xs tracking-widest gap-2">
                    <Rocket className="w-4 h-4" /> Criar Nova Campanha
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="bg-card border-border shadow-soft">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                            <p className={cn("text-3xl font-black", stat.color)}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tutorial */}
            <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 relative overflow-hidden">
                <div className="relative z-10 flex gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-2">Como aumentar suas vendas?</h3>
                        <ol className="grid gap-3 md:grid-cols-2 text-sm text-muted-foreground font-medium list-decimal list-inside">
                            <li>Crie uma campanha vinculada a um imóvel</li>
                            <li>Divulgue o link rastreável na sua Bio ou Stories</li>
                            <li>A Raquel atende quem clicar automaticamente</li>
                            <li>Analise quais posts geram leads reais</li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                    <Megaphone className="w-4 h-4" /> Campanhas Ativas
                </h3>

                <div className="grid gap-4">
                    {campaigns.map((camp) => {
                        const style = getTypeStyle(camp.type);
                        return (
                            <Card key={camp.id} className="bg-card border-border shadow-soft group hover:border-primary/40 transition-all rounded-[32px] overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                        <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0", style.bg)}>
                                            <style.icon className={cn("w-8 h-8", style.color)} />
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-xl font-black text-foreground tracking-tight">{camp.title}</h4>
                                                <span className="bg-success/10 text-success text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Ativa</span>
                                            </div>

                                            <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-2xl group-hover:bg-muted/50 transition-colors">
                                                <code className="text-[11px] font-bold text-muted-foreground truncate flex-1 px-4">{camp.link}</code>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleCopy(camp.link, camp.id)}
                                                    className={cn(
                                                        "rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest transition-all",
                                                        copiedLink === camp.id ? "bg-success hover:bg-success" : "bg-primary"
                                                    )}
                                                >
                                                    {copiedLink === camp.id ? <Check className="w-4 h-4" /> : <><Copy className="w-3 h-3 mr-2" /> Copiar</>}
                                                </Button>
                                            </div>

                                            <div className="flex flex-wrap gap-8 pt-2">
                                                <div className="flex items-center gap-3">
                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-black text-foreground">{camp.clicks}<span className="text-muted-foreground font-bold ml-1">Cliques</span></span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Users className="w-4 h-4 text-primary" />
                                                    <span className="text-sm font-black text-foreground">{camp.leads}<span className="text-muted-foreground font-bold ml-1">Leads</span></span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Target className="w-4 h-4 text-accent" />
                                                    <span className="text-sm font-black text-foreground">{camp.conversions}<span className="text-muted-foreground font-bold ml-1">Vendas</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl">
                                                <Share2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:text-hot">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
