'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    Kanban,
    Printer,
    MoreVertical,
    Phone,
    Calendar,
    CheckCircle2,
    XCircle,
    User,
    Users,
    Flame,
    Clock,
    AlertCircle,
    BarChart3,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { updateLeadStatus, getCrmLeads } from '@/lib/actions/crm';

type Lead = any; // Tipagem genérica do Drizzle

export function CrmView() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const data = await getCrmLeads();
                setLeads(data);
            } catch (error) {
                console.error("Erro ao carregar CRM:", error);
                toast.error("Erro ao carregar leads do funil.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeads();
    }, []);

    // Agrupamento lógico
    const columns = useMemo(() => {
        const fila = leads.filter(l => l.status === 'waiting' || l.status === 'ooh_rescheduled' || l.status === 'follow_up_pending');
        const atendimento = leads.filter(l => ((l.status === 'active' || l.status === 'Ativo') && (l.followUpCount || 0) === 0) || l.status.includes('hot_alert') || l.status === 'ooh_hot_alert_pending');
        const followup = leads.filter(l => l.status === 'scheduled' || l.status === 'scheduled_follow_up' || ((l.status === 'active' || l.status === 'Ativo') && (l.followUpCount || 0) > 0));
        const finalizados = leads.filter(l => l.status === 'won' || l.status === 'completed' || l.status?.startsWith('abandoned'));

        return { fila, atendimento, followup, finalizados };
    }, [leads]);

    // Estatísticas para Gráficos Visuais
    const stats = useMemo(() => {
        const totais = leads.length;
        const quentes = leads.filter(l => l.temperature === 'quente' || l.temperature === 'very_hot').length;
        const mornos = leads.filter(l => l.temperature === 'morno').length;
        const frios = leads.filter(l => l.temperature === 'frio').length;
        const convertidos = columns.finalizados.filter(l => l.status === 'won' || l.status === 'completed').length;
        const perdidos = columns.finalizados.filter(l => l.status?.startsWith('abandoned')).length;

        return { totais, quentes, mornos, frios, convertidos, perdidos };
    }, [leads, columns]);

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            // Optimistic UI Update
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus, followUpCount: newStatus === 'completed' || newStatus === 'won' ? 0 : l.followUpCount } : l));

            const result = await updateLeadStatus(leadId, newStatus);
            if (!result.success) {
                toast.error("Erro ao mover lead.");
                // Revert na falha: idealmente deveriamos refetch, mas reload já resolve:
                window.location.reload();
            }
        } catch (e) {
            toast.error("Ocorreu um erro no servidor.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    /**
     * Renderiza o Card individual de cada lead.
     */
    const renderLeadCard = (lead: Lead) => {
        return (
            <div key={lead.id} className="bg-card/80 backdrop-blur-sm border border-border/40 hover:border-accent/40 rounded-2xl p-4 shadow-sm transition-all relative group">
                {/* Header Card */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                            {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-sm text-foreground truncate max-w-[140px]" title={lead.name}>{lead.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
                                <Phone className="w-3 h-3" />
                                <span className="text-[10px] font-medium">{lead.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Menu de Ações (Oculto na Impressão) */}
                    <div className="print:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-2xl border-border/50">
                                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Mover para</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/50" />
                                <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'active')} className="text-xs font-bold cursor-pointer">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> Atendimento
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'scheduled')} className="text-xs font-bold cursor-pointer">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 mr-2" /> Follow-up (Nutrição)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'won')} className="text-xs font-bold cursor-pointer text-success focus:text-success">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Ganho / Convertido
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'abandoned')} className="text-xs font-bold cursor-pointer text-destructive focus:text-destructive">
                                    <XCircle className="w-3.5 h-3.5 mr-2" /> Perdido / Descartar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Badges Info */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                        (lead.temperature === 'quente' || lead.temperature === 'very_hot') ? 'bg-hot/10 text-hot' :
                            (lead.temperature === 'morno') ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                    )}>
                        {(lead.temperature === 'quente' || lead.temperature === 'very_hot') && <Flame className="w-2.5 h-2.5" />}
                        {lead.temperature}
                    </span>

                    {(lead.followUpCount || 0) > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] font-black uppercase tracking-wider border border-accent/20">
                            <ArrowRight className="w-2.5 h-2.5" /> Fup {(lead.followUpCount)}
                        </span>
                    )}

                    {lead.status === 'scheduled' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-wider border border-purple-500/20">
                            <Calendar className="w-2.5 h-2.5" /> Agendado
                        </span>
                    )}
                </div>

                {/* Print Only Text */}
                <div className="hidden print:block mt-3 pt-3 border-t border-border/20">
                    <p className="text-[10px] text-muted-foreground break-words">{lead.notes || 'Sem anotações.'}</p>
                    <p className="text-[9px] mt-1 font-bold">Temperatura: {lead.temperature} | Status Lógico: {lead.status}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 print-container">
            {/* Header & Ações */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="heading-xl text-foreground flex items-center gap-3">
                        <Kanban className="w-8 h-8 text-accent" />
                        CRM de Vendas
                    </h1>
                    <p className="text-body font-medium">Pipeline completo dos seus clientes em negociação e convertidos.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="h-12 border-border/50 rounded-2xl gap-2 font-black uppercase text-[10px] tracking-widest shrink-0 print:hidden btn-interactive"
                >
                    <Printer className="w-4 h-4" />
                    Exportar Relatório / Imprimir
                </Button>
            </div>

            {/* Dashboard Analítico Visual */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card/40 border border-border/40 p-5 rounded-[24px]">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Users className="w-4 h-4" /></div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Volume Total</span>
                    </div>
                    <p className="text-3xl font-black">{stats.totais}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Contatos no funil</p>
                </div>
                <div className="bg-hot/5 border border-hot/10 p-5 rounded-[24px]">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 rounded-lg bg-hot/10 flex items-center justify-center text-hot"><Flame className="w-4 h-4" /></div>
                        <span className="text-[10px] font-black text-hot uppercase tracking-wider">Altíssimo Potencial</span>
                    </div>
                    <p className="text-3xl font-black text-hot">{stats.quentes}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Leads Queimando</p>
                    {/* Barra visual mini */}
                    <div className="h-1 w-full bg-hot/10 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-hot transition-all" style={{ width: `${stats.totais ? (stats.quentes / stats.totais) * 100 : 0}%` }} />
                    </div>
                </div>
                <div className="bg-accent/5 border border-accent/10 p-5 rounded-[24px]">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent"><BarChart3 className="w-4 h-4" /></div>
                        <span className="text-[10px] font-black text-accent uppercase tracking-wider">Conversão</span>
                    </div>
                    <p className="text-3xl font-black text-accent">{stats.convertidos}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Negócios fechados</p>
                </div>
                <div className="bg-muted/10 border border-border/30 p-5 rounded-[24px]">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><XCircle className="w-4 h-4" /></div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Perdas</span>
                    </div>
                    <p className="text-3xl font-black">{stats.perdidos}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Descartados/Sem resposta</p>
                </div>
            </div>

            {/* Kanban Board Container */}
            <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto min-h-[600px] no-scrollbar pb-10">

                {/* Coluna 1: Fila de Entrada */}
                <div className="flex-1 min-w-[300px] flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50 px-1">
                        <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Fila de Entrada
                        </h3>
                        <span className="bg-muted text-xs font-bold px-2 py-0.5 rounded-md">{columns.fila.length}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 bg-muted/5 rounded-[24px] p-2 border border-border/20">
                        {columns.fila.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-30">
                                <Users className="w-8 h-8 mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Coluna Vazia</span>
                            </div>
                        ) : columns.fila.map(renderLeadCard)}
                    </div>
                </div>

                {/* Coluna 2: Em Atendimento */}
                <div className="flex-1 min-w-[300px] flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50 px-1">
                        <h3 className="font-black text-sm uppercase tracking-widest text-blue-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                            Em Atendimento
                        </h3>
                        <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-md border border-blue-500/20">{columns.atendimento.length}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 bg-blue-500/5 rounded-[24px] p-2 border border-blue-500/10">
                        {columns.atendimento.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-blue-400/30">
                                <User className="w-8 h-8 mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Nenhum Atendimento</span>
                            </div>
                        ) : columns.atendimento.map(renderLeadCard)}
                    </div>
                </div>

                {/* Coluna 3: Follow-Up */}
                <div className="flex-1 min-w-[300px] flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-accent/20 px-1">
                        <h3 className="font-black text-sm uppercase tracking-widest text-accent flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                            Follow-Up / Nutrição
                        </h3>
                        <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-0.5 rounded-md border border-accent/20">{columns.followup.length}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 bg-accent/5 rounded-[24px] p-2 border border-accent/10">
                        {columns.followup.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-accent/30">
                                <AlertCircle className="w-8 h-8 mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Nenhuma Rechamada</span>
                            </div>
                        ) : columns.followup.map(renderLeadCard)}
                    </div>
                </div>

                {/* Coluna 4: Finalizados / Convertidos */}
                <div className="flex-1 min-w-[300px] flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50 px-1">
                        <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            Finalizados
                        </h3>
                        <span className="bg-muted text-xs font-bold px-2 py-0.5 rounded-md">{columns.finalizados.length}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 bg-card/60 rounded-[24px] p-2 border border-border/20">
                        {columns.finalizados.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-30">
                                <CheckCircle2 className="w-8 h-8 mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Nenhum Registro</span>
                            </div>
                        ) : columns.finalizados.map(renderLeadCard)}
                    </div>
                </div>

            </div>

            {/* Print Styles Injection (Using a standard style block to inject print specific CSS cleanly) */}
            <style jsx global>{`
                @media print {
                    @page { margin: 1.5cm; size: landscape; }
                    body { background: white !important; color: black !important; }
                    
                    /* Hides sidebar and mobile headers explicitly */
                    aside, nav, header, button, .print\\:hidden { display: none !important; }
                    
                    /* Resets main canvas for printing */
                    main { margin: 0 !important; padding: 0 !important; background: white !important; width: 100% !important; overflow: visible !important; }
                    
                    /* Adjust charts & panels borders for black and white contrast */
                    .print-container { padding: 0 !important; }
                    .bg-card\\/40, .bg-hot\\/5, .bg-accent\\/5, .bg-muted\\/10 {
                        background: white !important;
                        border: 1px solid #e2e8f0 !important;
                        color: black !important;
                    }
                    .text-foreground, .text-muted-foreground { color: black !important;  }
                    .text-hot { color: #dc2626 !important; }
                    .text-accent { color: #4f46e5 !important; }
                    
                    /* Flatten Kanban to avoid scrolling issues */
                    .overflow-x-auto, .no-scrollbar { overflow: visible !important; }
                    .flex-col.lg\\:flex-row { flex-direction: row !important; flex-wrap: wrap !important; }
                    
                    /* Make columns fluid and visible */
                    .min-w-\\[300px\\] { min-width: 24% !important; max-width: 24% !important; flex: 1; break-inside: avoid; }
                    .bg-card\\/80 { border: 1px solid #ccc !important; box-shadow: none !important; margin-bottom: 8px; break-inside: avoid; }
                }
            `}</style>
        </div>
    );
}
