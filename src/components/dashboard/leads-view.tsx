'use client';

import { useState } from 'react';
import {
    Users,
    Download,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Flame,
    Clock,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function LeadsView() {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for UI demonstration
    const stats = {
        total: 24,
        dailyLimit: 100,
        hot: 8,
        monthEstimate: 3000
    };

    const leads = [
        { id: '1', name: 'João Silva', phone: '(11) 99999-9999', temperature: 'very_hot', status: 'Ativo', email: 'joao@email.com' },
        { id: '2', name: 'Maria Souza', phone: '(11) 88888-8888', temperature: 'hot', status: 'Ativo', email: 'maria@email.com' },
        { id: '3', name: 'Pedro Santos', phone: '(11) 77777-7777', temperature: 'warm', status: 'Ativo', email: 'pedro@email.com' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-xl text-foreground">Gestão de Leads</h1>
                    <p className="text-body mt-1">Sua lista de contatos e status de atendimento da Raquel.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-border rounded-2xl gap-2 font-bold uppercase text-xs tracking-widest h-12">
                        <Download className="w-4 h-4" /> Importar CSV
                    </Button>
                    <Button className="btn-primary h-12 px-6 font-bold uppercase text-xs tracking-widest gap-2">
                        <Plus className="w-4 h-4" /> Novo Lead
                    </Button>
                </div>
            </div>

            {/* Daily Progress */}
            <Card className="bg-card border-border shadow-soft overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <h3 className="font-display font-black text-lg text-foreground uppercase tracking-tight">Limite Diário de Importação</h3>
                            <p className="text-sm text-muted-foreground font-medium">Plano PRO: 3.000 leads/mês</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-black text-foreground">{stats.total}<span className="text-muted-foreground/30 text-2xl">/{stats.dailyLimit}</span></div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">importados hoje</p>
                        </div>
                    </div>
                    <div className="w-full bg-muted/30 h-4 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${(stats.total / stats.dailyLimit) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-4">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">0</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Faltam {stats.dailyLimit - stats.total} hoje</span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stats.dailyLimit}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-6 rounded-[32px] bg-accent/5 border border-accent/20">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <p className="font-black text-foreground uppercase tracking-tight text-sm">Atendimento Raquel</p>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Leads cadastrados hoje serão contatados amanhã no seu horário comercial configurado.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-6 rounded-[32px] bg-hot/5 border border-hot/20">
                    <div className="w-12 h-12 rounded-2xl bg-hot/10 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 text-hot" />
                    </div>
                    <div>
                        <p className="font-black text-foreground uppercase tracking-tight text-sm">Quarentena Ativa</p>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Bloqueamos contatos repetidos em um intervalo de 15 dias para evitar spam e garantir o fluxo da IA.</p>
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou telefone..."
                            className="pl-12 h-14 bg-card border-border rounded-2xl focus-visible:ring-primary shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-14 w-14 rounded-2xl border-border">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>

                <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-soft">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/20">
                                    <th className="text-left py-6 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Corretor / Lead</th>
                                    <th className="text-left py-6 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hidden md:table-cell">Contato</th>
                                    <th className="text-left py-6 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Status IA</th>
                                    <th className="text-right py-6 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-sm group-hover:scale-110 transition-transform">
                                                    {lead.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-foreground text-base tracking-tight">{lead.name}</p>
                                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{lead.status} • Importado</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 hidden md:table-cell">
                                            <p className="text-sm font-bold text-foreground">{lead.phone}</p>
                                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <span className={cn(
                                                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                lead.temperature === 'very_hot' ? 'bg-hot/10 text-hot border-hot/20' :
                                                    lead.temperature === 'hot' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                            )}>
                                                {lead.temperature === 'very_hot' && <Flame className="w-3 h-3 animate-pulse" />}
                                                {lead.temperature.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/50">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
