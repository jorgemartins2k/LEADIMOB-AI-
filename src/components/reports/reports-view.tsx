'use client';

import { useState, useEffect } from 'react';
import { addDays, subDays } from 'date-fns';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Rectangle, Cell
} from 'recharts';
import {
    BarChart3,
    Calendar as CalendarIcon,
    Download,
    TrendingUp,
    Users,
    Flame,
    MessageSquare,
    MapPin,
    Briefcase,
    Home
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import { getReportMetrics } from '@/lib/actions/reports';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function ReportsView() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            if (!date?.from || !date?.to) return;
            setIsLoading(true);
            try {
                const report = await getReportMetrics({ from: date.from, to: date.to });
                if (report.success) {
                    setData(report);
                }
            } catch (err) {
                toast.error("Erro ao carregar relatórios");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, [date]);

    // Formatadores
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card/90 backdrop-blur-md border border-border/50 p-3 rounded-xl shadow-xl">
                    <p className="font-bold text-xs uppercase text-muted-foreground mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm font-black" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
                <p className="text-xs font-black tracking-widest uppercase text-muted-foreground">Extraindo Inteligência de Dados...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 print-container">
            {/* Header & Filtros */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/30 pb-6">
                <div>
                    <h1 className="heading-xl text-foreground flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-accent" />
                        Relatórios Analíticos
                    </h1>
                    <p className="text-body font-medium mt-1">Inteligência extraída das conversas da Raquel no período selecionado.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <CalendarDateRangePicker date={date} setDate={setDate} />
                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="h-10 border-border/50 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest shrink-0 print:hidden shadow-sm hover:shadow"
                    >
                        <Download className="w-4 h-4" /> PDF
                    </Button>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-card to-muted/20 border border-border/40 p-6 rounded-[24px] shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Volume Total</p>
                            <h3 className="text-3xl font-black text-foreground">{data?.summary.total || 0}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Leads gerados no período selecionado</p>
                </div>

                <div className="bg-gradient-to-br from-card to-hot/5 border border-hot/10 p-6 rounded-[24px] shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-hot/10 rounded-full blur-2xl group-hover:bg-hot/20 transition-all" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-hot/10 flex items-center justify-center text-hot">
                            <Flame className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-hot">Aquecidos p/ Corretor</p>
                            <h3 className="text-3xl font-black text-hot">{data?.summary.hotSent || 0}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Leads marcados como Quente/Muito Quente</p>
                </div>

                <div className="bg-gradient-to-br from-card to-accent/5 border border-accent/10 p-6 rounded-[24px] shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-accent">Follow-ups de Sucesso</p>
                            <h3 className="text-3xl font-black text-accent">{data?.summary.followupsSuccess || 0}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Leads engajados após a 1ª tentativa</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Tendência de Volume (Area Chart) */}
                <div className="xl:col-span-2 bg-card/40 border border-border/40 p-6 sm:p-8 rounded-[32px] shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        <h3 className="font-black text-lg uppercase tracking-tight text-foreground">Performance no Tempo</h3>
                    </div>
                    {isLoading ? (
                        <div className="h-[300px] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        name="Volume de Leads"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Funil de Vendas (Bar Chart Horizontal) */}
                <div className="bg-card/40 border border-border/40 p-6 sm:p-8 rounded-[32px] shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        <h3 className="font-black text-lg uppercase tracking-tight text-foreground">Funil do Pipeline</h3>
                    </div>
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={data?.funnel || []}
                                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="stage"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                        width={110}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="value" name="Leads" radius={[0, 8, 8, 0]} barSize={32}>
                                        {data?.funnel.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Insights Extraídos */}
            <div className="mt-8 pt-8 border-t border-border/30">
                <h2 className="heading-lg text-foreground mb-6 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                    Insights Inteligentes Extraídos
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bairros/Regiões Mais Procurados */}
                    <div className="bg-card/30 border border-border/50 p-6 rounded-[24px]">
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin className="w-5 h-5 text-orange-500" />
                            <h3 className="font-black uppercase tracking-widest text-xs text-muted-foreground">Regiões Mais Procuradas</h3>
                        </div>
                        <div className="space-y-4">
                            {!isLoading && data?.insights?.topBairros.map((b: any, i: number) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-muted-foreground bg-muted w-6 h-6 rounded-md flex items-center justify-center">{i + 1}</span>
                                        <span className="font-bold text-sm group-hover:text-accent transition-colors capitalize">{b.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-foreground bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                                        {b.count} buscas
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Perfis que Mais Fecham */}
                    <div className="bg-card/30 border border-border/50 p-6 rounded-[24px]">
                        <div className="flex items-center gap-3 mb-6">
                            <Briefcase className="w-5 h-5 text-success" />
                            <h3 className="font-black uppercase tracking-widest text-xs text-muted-foreground">Perfis que Mais Convertem</h3>
                        </div>
                        <div className="space-y-4">
                            {!isLoading && data?.insights?.topPerfis.map((p: any, i: number) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-success bg-success/10 w-6 h-6 rounded-md flex items-center justify-center">{i + 1}</span>
                                        <span className="font-bold text-sm group-hover:text-success transition-colors truncate max-w-[180px]" title={p.name}>{p.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-success bg-success/10 px-3 py-1 rounded-full border border-success/20">
                                        {p.count} fechamentos
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Imóveis Mais Procurados */}
                    <div className="bg-card/30 border border-border/50 p-6 rounded-[24px]">
                        <div className="flex items-center gap-3 mb-6">
                            <Home className="w-5 h-5 text-blue-500" />
                            <h3 className="font-black uppercase tracking-widest text-xs text-muted-foreground">Imóveis Mais Procurados</h3>
                        </div>
                        <div className="space-y-4">
                            {!isLoading && data?.insights?.topImoveis.map((b: any, i: number) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-muted-foreground bg-muted w-6 h-6 rounded-md flex items-center justify-center">{i + 1}</span>
                                        <span className="font-bold text-sm group-hover:text-blue-500 transition-colors capitalize">{b.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-foreground bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                        {b.count} menções
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Composição Familiar */}
                    <div className="bg-card/30 border border-border/50 p-6 rounded-[24px]">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="w-5 h-5 text-purple-500" />
                            <h3 className="font-black uppercase tracking-widest text-xs text-muted-foreground">Estrutura Familiar</h3>
                        </div>
                        <div className="space-y-4">
                            {!isLoading && data?.insights?.topFamilias.map((p: any, i: number) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-muted-foreground bg-muted w-6 h-6 rounded-md flex items-center justify-center">{i + 1}</span>
                                        <span className="font-bold text-sm group-hover:text-purple-500 transition-colors truncate max-w-[180px]" title={p.name} style={{ textTransform: 'capitalize' }}>{p.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-foreground bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                        {p.count} menções
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles Injection */}
            <style jsx global>{`
                @media print {
                    @page { margin: 1cm; size: a4 portrait; }
                    body { background: white !important; color: black !important; }
                    aside, nav, header, button, .print\\:hidden { display: none !important; }
                    main { margin: 0 !important; padding: 0 !important; background: white !important; width: 100% !important; }
                    .print-container { padding: 0 !important; }
                    .bg-card\\/40, .bg-card\\/30, .bg-gradient-to-br {
                        background: white !important;
                        border: 1px solid #e2e8f0 !important;
                        color: black !important;
                        break-inside: avoid;
                    }
                    * { color: black !important; }
                    .text-muted-foreground { color: #64748b !important; }
                    .text-hot { color: #dc2626 !important; }
                    .text-accent { color: #4f46e5 !important; }
                    .text-success { color: #16a34a !important; }
                    .grid { display: block !important; }
                    .grid > div { margin-bottom: 20px !important; width: 100% !important; }
                    .recharts-wrapper { max-height: 200px !important; }
                }
            `}</style>
        </div>
    );
}
