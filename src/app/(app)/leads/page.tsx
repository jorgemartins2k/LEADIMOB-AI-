import { Plus, Search, Filter, User, Phone, Calendar, ArrowUpRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLeads } from "@/lib/actions/leads";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function LeadsPage() {
    const leads = await getLeads().catch(() => []);

    const statusColors: Record<string, string> = {
        waiting: "bg-surface-2 text-text-muted border-transparent",
        in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        warm: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        transferred: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        discarded: "bg-danger/10 text-danger border-danger/20",
    };

    const statusLabels: Record<string, string> = {
        waiting: "Aguardando",
        in_progress: "Em Atendimento",
        warm: "Aquecido",
        transferred: "Transferido",
        discarded: "Descartado",
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-2 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-text">Meus Leads</h1>
                    <p className="text-text-muted text-sm">Gerencie os contatos que a Raquel está atendendo para você.</p>
                </div>
                <Link href="/leads/novo">
                    <Button className="bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 px-6 h-11">
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Lead
                    </Button>
                </Link>
            </div>

            {/* Grid section */}
            {leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-surface-2 rounded-3xl bg-surface/30">
                    <div className="h-20 w-20 bg-surface-2 rounded-full flex items-center justify-center mb-6">
                        <User className="h-10 w-10 text-text-muted opacity-30" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-text">Sua lista de leads está vazia</h3>
                    <p className="text-text-muted mt-2 max-w-sm text-center text-sm">
                        Adicione leads manualmente ou importe sua planilha para que a Raquel comece a trabalhar imediatamente.
                    </p>
                    <Link href="/leads/novo" className="mt-8">
                        <Button variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary font-bold px-8 rounded-xl h-12">
                            Começar agora
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {leads.map((lead) => (
                        <Card key={lead.id} className="bg-surface border-surface-2 overflow-hidden hover:border-primary/30 transition-all rounded-[1.5rem] group shadow-sm">
                            <CardHeader className="p-5 pb-2">
                                <div className="flex justify-between items-start mb-3">
                                    <Badge variant="outline" className={cn("text-[9px] uppercase font-black border tracking-wider px-2 py-0.5", statusColors[lead.status])}>
                                        {statusLabels[lead.status]}
                                    </Badge>
                                    <span className="text-[10px] font-bold text-text-muted opacity-60 flex items-center gap-1 uppercase tracking-widest">
                                        <Calendar className="h-3 w-3" /> {new Date(lead.createdAt!).toLocaleDateString()}
                                    </span>
                                </div>
                                <CardTitle className="text-xl font-display font-bold text-text flex items-center gap-2 group-hover:text-primary transition-colors">
                                    {lead.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                                    <Phone className="h-3 w-3 text-secondary" /> {lead.phone}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 pt-3 space-y-4">
                                <div className="bg-bg/40 p-3 rounded-2xl border border-surface-2">
                                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest block mb-1">Origem</span>
                                    <span className="text-xs font-semibold text-text italic">{lead.source || "Manual"}</span>
                                </div>
                                {lead.notes && (
                                    <div className="border-l-2 border-primary/20 pl-3">
                                        <p className="text-[11px] text-text-muted line-clamp-2 italic leading-relaxed">&quot;{lead.notes}&quot;</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="p-5 pt-0 flex gap-2">
                                <Button variant="ghost" size="sm" className="flex-1 bg-surface-2/30 border-surface-2 hover:bg-surface-2 text-[10px] font-bold uppercase tracking-wider h-10 rounded-xl transition-all">
                                    Conversa <MessageSquare className="h-3.5 w-3.5 ml-2 opacity-60" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
