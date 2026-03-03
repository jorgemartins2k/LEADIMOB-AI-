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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="heading-xl text-foreground">Gestão de Leads</h1>
                    <p className="text-body mt-1 font-normal">Controle total sobre o funil de vendas da Raquel.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="border-border/50 rounded-2xl gap-3 font-semibold uppercase text-[10px] tracking-wider h-14 px-8 btn-interactive hidden sm:flex">
                        <Download className="w-4 h-4" /> Exportar Leads
                    </Button>
                    <Button className="btn-primary h-14 px-10 font-semibold uppercase text-[10px] tracking-wider gap-3 shadow-lg hover:scale-105 active:scale-95 transition-all">
                        <Plus className="w-5 h-5" /> Novo de Lead
                    </Button>
                </div>
            </div>

            {/* Daily Progress */}
            <div className="card-premium p-10 md:p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -z-10" />

                <div className="flex flex-col lg:flex-row items-center justify-between mb-10 gap-8">
                    <div className="space-y-3 flex-1 text-center lg:text-left">
                        <h3 className="heading-lg text-foreground uppercase tracking-tight">Capacidade da IA</h3>
                        <p className="text-body font-normal">Plano PRO: <span className="text-foreground font-semibold">3.000 leads/mês</span> ativos.</p>
                    </div>
                    <div className="text-center lg:text-right">
                        <div className="text-6xl font-black text-foreground tracking-tighter">
                            {stats.total}
                            <span className="text-muted-foreground/20 text-3xl ml-2 font-black">/ {stats.dailyLimit}</span>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">processados hoje</p>
                    </div>
                </div>
                <div className="relative h-4 w-full bg-muted/30 rounded-full overflow-hidden p-1 border border-border/50 shadow-inner">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(15,23,42,0.3)]"
                        style={{ width: `${(stats.total / stats.dailyLimit) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between mt-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
                    <span>Performance Atual</span>
                    <span className="text-primary opacity-100">Faltam {stats.dailyLimit - stats.total} hoje para o limite</span>
                </div>
            </div>

            {/* Info Section - Bento-ish Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="group flex items-start gap-6 p-10 rounded-[40px] bg-accent/5 border border-accent/10 shadow-sm hover:shadow-md transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <p className="font-black text-foreground uppercase tracking-tight text-lg">Atendimento Ativo</p>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">Leads importados agora iniciam a qualificação no próximo ciclo comercial.</p>
                    </div>
                </div>
                <div className="group flex items-start gap-6 p-10 rounded-[40px] bg-hot/5 border border-hot/10 shadow-sm hover:shadow-md transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-hot text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-hot/20">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <p className="font-black text-foreground uppercase tracking-tight text-lg">Proteção Anti-Spam</p>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">Intervalo de 15 dias entre contatos automáticos para garantir a conversão.</p>
                    </div>
                </div>
            </div>

            {/* Leads Table Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                        <Input
                            placeholder="Buscar leads ativos..."
                            className="pl-14 h-16 bg-card border-border/50 rounded-[24px] focus-visible:ring-accent/20 focus-visible:border-accent font-bold text-base shadow-sm group-hover:border-border transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-16 w-16 rounded-[24px] border-border/50 hover:bg-muted btn-interactive shadow-sm">
                        <Filter className="w-5 h-5" />
                    </Button>
                </div>

                <div className="card-premium overflow-hidden group">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/50 bg-muted/10">
                                    <th className="text-left py-8 px-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Nome do Lead</th>
                                    <th className="text-left py-8 px-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hidden md:table-cell">Contato Direto</th>
                                    <th className="text-left py-8 px-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Termômetro IA</th>
                                    <th className="text-right py-8 px-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Gestão</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-muted/30 transition-all duration-300 group cursor-pointer">
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-inner group-hover:scale-105 group-hover:bg-primary/20 transition-all">
                                                    {lead.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground text-lg tracking-tight group-hover:text-accent transition-colors">{lead.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{lead.status}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10 hidden md:table-cell">
                                            <p className="text-base font-bold text-foreground">{lead.phone}</p>
                                            <p className="text-xs text-muted-foreground font-medium opacity-60">{lead.email}</p>
                                        </td>
                                        <td className="py-8 px-10">
                                            <span className={cn(
                                                "inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm transition-all group-hover:shadow-md",
                                                lead.temperature === 'very_hot' ? 'bg-hot/10 text-hot border-hot/20' :
                                                    lead.temperature === 'hot' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                        'bg-accent/10 text-accent border-accent/20'
                                            )}>
                                                {lead.temperature === 'very_hot' && <Flame className="w-3.5 h-3.5 animate-pulse" />}
                                                {lead.temperature.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-8 px-10 text-right">
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-muted/50 btn-interactive">
                                                <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Placeholder */}
                    <div className="p-8 border-t border-border/50 bg-muted/5 flex items-center justify-center">
                        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">
                            Carregar mais leads
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
