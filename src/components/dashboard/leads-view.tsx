'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    Download,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Flame,
    Clock,
    AlertCircle,
    Upload,
    Loader2,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LeadImportModal } from './lead-import-modal';
import { getLeads, deleteLead, checkBusinessStatus, cleanupLeads } from '@/lib/actions/leads';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from 'lucide-react';

export function LeadsView() {
    const [searchTerm, setSearchTerm] = useState('');
    const [leadsList, setLeadsList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tempFilter, setTempFilter] = useState<string | null>(null);

    // Modal state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [inBusinessHours, setInBusinessHours] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [leadsData, businessStatus] = await Promise.all([
                    getLeads(),
                    checkBusinessStatus()
                ]);
                setLeadsList(leadsData);
                setInBusinessHours(businessStatus);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCleanup = async () => {
        if (!confirm("Isso excluirá todos os leads atuais ao final do expediente. Prosseguir?")) return;
        setIsCleaning(true);
        try {
            const result = await cleanupLeads();
            if (result.success) {
                toast.success("Lista limpa com sucesso.");
                setLeadsList([]);
            } else {
                toast.error(result.error || "Erro ao limpar lista.");
            }
        } catch (error) {
            toast.error("Erro ao limpar lista.");
        } finally {
            setIsCleaning(false);
        }
    };

    const confirmDelete = (id: string, name: string) => {
        setLeadToDelete({ id, name });
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!leadToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteLead(leadToDelete.id);
            if (result.success) {
                toast.success(`Lead ${leadToDelete.name} excluído com sucesso.`);
                setLeadsList(prev => prev.filter(l => l.id !== leadToDelete.id));
                setIsDeleteDialogOpen(false);
            } else {
                toast.error("Erro ao excluir lead.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir lead.");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredLeads = leadsList.filter((lead) => {
        const matchesSearch =
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm);

        const matchesTemp = tempFilter ? lead.temperature === tempFilter : true;

        return matchesSearch && matchesTemp;
    });

    const stats = {
        total: leadsList.length,
        dailyLimit: 100,
        hot: leadsList.filter(l => l.temperature === 'very_hot' || l.temperature === 'quente').length,
    };

    const temperatures = [
        { id: "quente", label: "Quente", icon: Flame, color: "text-red-500", bg: "bg-red-500/10" },
        { id: "morno", label: "Morno", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
        { id: "frio", label: "Frio", icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="heading-xl text-foreground">Gestão de Leads</h1>
                    <p className="text-body mt-1 font-normal">Controle total sobre o funil de vendas da Raquel.</p>
                    {inBusinessHours && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Horário de Atendimento: Lançamento Manual Bloqueado
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <LeadImportModal>
                        <Button
                            variant="outline"
                            disabled={inBusinessHours}
                            className="border-border/50 rounded-2xl gap-3 font-semibold uppercase text-[10px] tracking-wider h-14 px-8 btn-interactive hidden sm:flex"
                        >
                            <Upload className="w-4 h-4" /> Importar Leads
                        </Button>
                    </LeadImportModal>
                    <Button
                        className="btn-primary h-14 px-10 font-semibold uppercase text-[10px] tracking-wider gap-3 shadow-lg hover:scale-105 active:scale-95 transition-all"
                        asChild={!inBusinessHours}
                        disabled={inBusinessHours}
                        onClick={inBusinessHours ? () => toast.error("Não é permitido lançar leads durante o expediente.") : undefined}
                    >
                        {!inBusinessHours ? (
                            <Link href="/leads/novo">
                                <Plus className="w-5 h-5" /> Novo de Lead
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5" /> Sistema em Operação
                            </div>
                        )}
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
                        style={{ width: `${Math.min((stats.total / stats.dailyLimit) * 100, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between mt-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">
                    <span>Performance Atual</span>
                    <span className="text-primary opacity-100">
                        {stats.total >= stats.dailyLimit ? "Limite diário atingido" : `Faltam ${stats.dailyLimit - stats.total} hoje para o limite`}
                    </span>
                </div>
            </div>

            {/* Info Section - Bento-ish Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="group flex items-start gap-6 p-10 rounded-[40px] bg-accent/5 border border-accent/10 shadow-sm hover:shadow-md transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                        <Users className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <p className="font-black text-foreground uppercase tracking-tight text-lg">Total de Contatos</p>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">Você possui {stats.total} leads registrados sob cuidados da Raquel.</p>
                    </div>
                </div>
                <div className="group flex items-start gap-6 p-10 rounded-[40px] bg-hot/5 border border-hot/10 shadow-sm hover:shadow-md transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-hot text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-hot/20">
                        <Flame className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <p className="font-black text-foreground uppercase tracking-tight text-lg">Leads Quentes</p>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{stats.hot} leads estão com alto potencial de fechamento neste momento.</p>
                    </div>
                </div>
            </div>

            {/* Leads Table Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                        <Input
                            placeholder="Buscar por nome ou WhatsApp..."
                            className="pl-14 h-16 bg-card border-border/50 rounded-[24px] focus-visible:ring-accent/20 focus-visible:border-accent font-bold text-base shadow-sm group-hover:border-border transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-2xl border border-border/30">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTempFilter(null)}
                            className={cn(
                                "h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                tempFilter === null ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            Todos
                        </Button>
                        {temperatures.map((t) => (
                            <Button
                                key={t.id}
                                variant="ghost"
                                size="sm"
                                onClick={() => setTempFilter(t.id)}
                                className={cn(
                                    "h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2",
                                    tempFilter === t.id ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <t.icon className={cn("w-3.5 h-3.5", tempFilter === t.id ? "" : t.color)} />
                                {t.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="card-premium overflow-hidden group">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Carregando seus leads...</p>
                            </div>
                        ) : filteredLeads.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/50 bg-muted/10">
                                        <th className="text-left py-8 px-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Nome do Lead</th>
                                        <th className="text-left py-8 px-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hidden md:table-cell">Contato Direto</th>
                                        <th className="text-left py-8 px-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Termômetro IA</th>
                                        <th className="text-right py-8 px-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Excluir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-muted/30 transition-all duration-300 group cursor-pointer">
                                            <td className="py-8 px-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-inner group-hover:scale-105 group-hover:bg-primary/20 transition-all">
                                                        {lead.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground text-lg tracking-tight group-hover:text-accent transition-colors">{lead.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={cn("w-1.5 h-1.5 rounded-full", lead.status === 'active' || lead.status === 'Ativo' ? 'bg-success' : 'bg-muted-foreground')} />
                                                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{lead.status}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-8 px-10 hidden md:table-cell">
                                                <p className="text-base font-bold text-foreground">{lead.phone}</p>
                                                <p className="text-xs text-muted-foreground font-medium opacity-60 capitalize">{lead.source}</p>
                                            </td>
                                            <td className="py-8 px-10">
                                                <span className={cn(
                                                    "inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm transition-all group-hover:shadow-md",
                                                    (lead.temperature === 'very_hot' || lead.temperature === 'quente') ? 'bg-hot/10 text-hot border-hot/20' :
                                                        (lead.temperature === 'hot' || lead.temperature === 'morno') ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                            'bg-accent/10 text-accent border-accent/20'
                                                )}>
                                                    {(lead.temperature === 'very_hot' || lead.temperature === 'quente') && <Flame className="w-3.5 h-3.5 animate-pulse" />}
                                                    {lead.temperature.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-8 px-10 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDelete(lead.id, lead.name);
                                                    }}
                                                    className="h-12 w-12 rounded-2xl hover:bg-destructive/10 hover:text-destructive btn-interactive"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-32 flex flex-col items-center justify-center gap-6 text-center px-10">
                                <Search className="w-16 h-16 text-muted-foreground opacity-20" />
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-foreground uppercase tracking-tight">Nenhum Lead Encontrado</h4>
                                    <p className="text-muted-foreground font-medium max-w-xs mx-auto">Tente ajustar sua busca ou os filtros de temperatura para encontrar o que procura.</p>
                                </div>
                                <Button variant="outline" onClick={() => { setSearchTerm(''); setTempFilter(null); }} className="h-12 rounded-2xl border-border px-8 font-black uppercase text-[10px] tracking-widest">
                                    Limpar todos os filtros
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Exclusão Premium */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-2xl">
                    <div className="relative bg-card/90 backdrop-blur-2xl border border-white/10 rounded-[40px] overflow-hidden p-10 animate-in zoom-in duration-300">
                        {/* Background Decoration */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-destructive/10 blur-[80px] rounded-full" />

                        <div className="relative z-10 space-y-8">
                            <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto shadow-inner border border-destructive/20 rotate-3 group-hover:rotate-0 transition-transform">
                                <AlertTriangle className="w-10 h-10 text-destructive animate-pulse" />
                            </div>

                            <div className="space-y-3 text-center">
                                <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">
                                    Confirmar Exclusão
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground font-medium leading-relaxed">
                                    Você está prestes a remover o lead <span className="text-foreground font-bold italic">"{leadToDelete?.name}"</span>. Esta ação não poderá ser desfeita.
                                </DialogDescription>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                    className="h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:bg-muted/50"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="h-16 rounded-2xl bg-destructive text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/20 hover:scale-105 active:scale-95 transition-all gap-2"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    Excluir Agora
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
