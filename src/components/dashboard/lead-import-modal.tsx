"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
    Upload,
    X,
    FileText,
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Info,
    ArrowRight
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { extractLeadsFromContent, bulkInsertLeads } from "@/lib/actions/import-leads";
import { getLeadLimitServerAction } from "@/lib/actions/leads";

export function LeadImportModal({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [status, setStatus] = useState<{ remaining: number; dailyLimit: number } | null>(null);
    const [result, setResult] = useState<{ imported: number; skipped: number; limited: number; errors: number } | null>(null);
    const [extractedLeads, setExtractedLeads] = useState<{ name: string; phone: string }[]>([]);

    const loadStatus = useCallback(async () => {
        try {
            const limit = await getLeadLimitServerAction();
            setStatus({ remaining: limit.remaining, dailyLimit: limit.dailyLimit });
        } catch (error) {
            console.error("Erro ao carregar status:", error);
        }
    }, []);

    useEffect(() => {
        if (open) loadStatus();
    }, [open, loadStatus]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setIsProcessing(true);
        setResult(null);
        setExtractedLeads([]);

        try {
            for (const file of acceptedFiles) {
                const reader = new FileReader();

                const fileContent = await new Promise<string>((resolve) => {
                    reader.onload = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        resolve(base64);
                    };

                    if (file.type.startsWith('image/')) {
                        reader.readAsDataURL(file);
                    } else if (file.type === 'application/pdf') {
                        reader.readAsDataURL(file);
                    } else {
                        reader.readAsText(file);
                    }
                });

                const isImage = file.type.startsWith('image/');
                const leads = await extractLeadsFromContent(fileContent, isImage);
                setExtractedLeads(prev => [...prev, ...leads]);
            }
        } catch (error) {
            console.error("Erro no processamento:", error);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt', '.csv']
        },
        multiple: true
    });

    const handleConfirmImport = async () => {
        if (extractedLeads.length === 0) return;

        setIsImporting(true);
        try {
            const res = await bulkInsertLeads(extractedLeads);
            setResult(res);
            setExtractedLeads([]);
            loadStatus(); // Refresh slots
        } catch (error) {
            console.error("Erro na importação:", error);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
                setResult(null);
                setExtractedLeads([]);
                setIsProcessing(false);
                setIsImporting(false);
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border rounded-[32px] p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="px-10 py-8 border-b border-border bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                                <Upload className="w-6 h-6 text-primary" /> Importar Leads Inteligente
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground font-medium mt-1">
                                Suba PDFs ou Imagens e a Raquel extrairá os contatos para você.
                            </DialogDescription>
                        </div>
                        {status && (
                            <div className="text-right px-4 py-2 rounded-2xl bg-primary/5 border border-primary/20">
                                <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Suas Vagas</p>
                                <p className="text-lg font-black text-primary">{status.remaining} / {status.dailyLimit}</p>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="p-10 space-y-8">
                    {!result && extractedLeads.length === 0 && !isProcessing && (
                        <div
                            {...getRootProps()}
                            className={cn(
                                "group border-4 border-dashed rounded-[40px] p-16 flex flex-col items-center justify-center gap-6 transition-all duration-500 cursor-pointer",
                                isDragActive
                                    ? "bg-primary/5 border-primary scale-[0.98] shadow-inner"
                                    : "bg-muted/10 border-muted-foreground/10 hover:border-primary/30 hover:bg-muted/20"
                            )}
                        >
                            <input {...getInputProps()} />
                            <div className="w-24 h-24 rounded-3xl bg-card border border-border flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-xl font-black text-foreground uppercase tracking-tight">Arraste seus arquivos aqui</p>
                                <p className="text-sm font-bold text-muted-foreground opacity-60">PDF, Imagens (JPEG, PNG) ou Texto</p>
                            </div>
                            <Button variant="outline" className="mt-4 px-10 h-14 rounded-2xl border-border font-black uppercase text-[10px] tracking-widest pointer-events-none group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                                Selecionar do computador
                            </Button>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="py-20 flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in duration-500">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                                <Loader2 className="w-20 h-20 text-primary animate-spin relative z-10" />
                            </div>
                            <div className="text-center space-y-3">
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Raquel está lendo seus arquivos...</h3>
                                <p className="text-muted-foreground font-medium">Isso pode levar alguns segundos dependendo da quantidade de leads.</p>
                            </div>
                        </div>
                    )}

                    {extractedLeads.length > 0 && !isProcessing && !isImporting && !result && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Leads Identificados ({extractedLeads.length})</h3>
                                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-hot hover:bg-hot/10" onClick={() => setExtractedLeads([])}>
                                    Limpar Tudo
                                </Button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto pr-4 space-y-3 no-scrollbar">
                                {extractedLeads.map((lead, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-muted/20 border border-border/50 hover:border-border transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center font-black text-primary group-hover:scale-110 transition-transform">
                                                {lead.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-foreground tracking-tight">{lead.name}</p>
                                                <p className="text-xs font-bold text-muted-foreground opacity-60">{lead.phone}</p>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="w-5 h-5 text-success opacity-20 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>

                            {status && status.remaining < extractedLeads.length && (
                                <div className="p-4 rounded-2xl bg-hot/5 border border-hot/20 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-hot shrink-0 mt-0.5" />
                                    <p className="text-xs font-bold text-hot/80">
                                        Atenção: Você tem apenas {status.remaining} vagas restantes hoje. Os primeiros {status.remaining} leads válidos e fora de quarentena serão importados.
                                    </p>
                                </div>
                            )}

                            <div className="pt-6 border-t border-border flex gap-4">
                                <Button
                                    className="flex-1 h-16 rounded-3xl bg-foreground text-background font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                                    onClick={handleConfirmImport}
                                    disabled={status?.remaining === 0}
                                >
                                    {status?.remaining === 0
                                        ? "Sem vagas disponíveis hoje"
                                        : `Confirmar Importação (${Math.min(extractedLeads.length, status?.remaining || 0)} Vagas)`}
                                </Button>
                            </div>
                        </div>
                    )}

                    {isImporting && (
                        <div className="py-20 flex flex-col items-center justify-center gap-8">
                            <Loader2 className="w-16 h-16 text-accent animate-spin" />
                            <div className="text-center">
                                <p className="text-xl font-black text-foreground uppercase">Salvando contatos no sistema...</p>
                                <p className="text-muted-foreground font-medium mt-1">Verificando quarentena e vagas do dia ({status?.remaining} restantes).</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="py-10 space-y-8 animate-in zoom-in duration-500">
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-24 h-24 rounded-[40px] bg-success/10 text-success flex items-center justify-center shadow-inner">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-3xl font-black text-foreground uppercase tracking-tight">Importação Finalizada!</h3>
                                    <p className="text-muted-foreground font-medium mt-1">Status da operação:</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-[32px] bg-success/5 border border-success/20 text-center">
                                    <p className="text-3xl font-black text-success">{result.imported}</p>
                                    <p className="text-[10px] font-black text-success/60 uppercase tracking-widest mt-1">Novos Leads</p>
                                </div>
                                <div className="p-6 rounded-[32px] bg-orange-500/5 border border-orange-500/20 text-center">
                                    <p className="text-3xl font-black text-orange-500">{result.skipped}</p>
                                    <p className="text-[10px] font-black text-orange-500/60 uppercase tracking-widest mt-1">Em Quarentena</p>
                                </div>
                                <div className="p-6 rounded-[32px] bg-hot/5 border border-hot/20 text-center">
                                    <p className="text-3xl font-black text-hot">{result.limited}</p>
                                    <p className="text-[10px] font-black text-hot/60 uppercase tracking-widest mt-1">Limite atingido</p>
                                </div>
                                <div className="p-6 rounded-[32px] bg-muted/10 border border-border text-center">
                                    <p className="text-3xl font-black text-muted-foreground">{result.errors}</p>
                                    <p className="text-[10px) font-black text-muted-foreground/60 uppercase tracking-widest mt-1">Erros</p>
                                </div>
                            </div>

                            <Button className="w-full h-18 rounded-[32px] bg-foreground text-background font-black uppercase text-xs tracking-[0.2em] shadow-2xl" onClick={() => setOpen(false)}>
                                Voltar ao Painel
                            </Button>
                        </div>
                    )}

                    {!result && !isProcessing && (
                        <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 flex items-start gap-6 group hover:bg-primary/10 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                <Info className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-foreground text-sm uppercase tracking-tight">Dica para o corretor</p>
                                <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                                    Por favor, para uma melhor leitura <span className="text-primary">importe um arquivo organizado</span>. PDFs de cadastros ou fotos nítidas de planilhas/listas funcionam melhor com a nossa IA.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
