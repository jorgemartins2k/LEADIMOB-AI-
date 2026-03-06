import { getPropertyById } from "@/lib/actions/properties";
import { notFound } from "next/navigation";
import {
    ChevronLeft,
    MapPin,
    BedDouble,
    Maximize2,
    Car,
    ShieldCheck,
    HandCoins,
    CreditCard,
    Building,
    Share2,
    MessageSquare,
    DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface PropertyDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
    const { id } = await params;
    const property = await getPropertyById(id);

    if (!property) {
        notFound();
    }

    const photos = property.photos && property.photos.length > 0
        ? property.photos
        : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop"];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <Link href="/imoveis">
                    <Button variant="ghost" className="gap-2 rounded-2xl hover:bg-muted transition-all">
                        <ChevronLeft className="h-4 w-4" /> Voltar para Portfólio
                    </Button>
                </Link>
                <div className="flex gap-3">
                    <Button variant="outline" size="icon" className="rounded-2xl border-border/50 hover:bg-muted">
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button className="btn-primary rounded-2xl px-6 gap-2 font-bold uppercase text-[10px] tracking-widest">
                        <MessageSquare className="h-4 w-4" /> Gerar Abordagem IA
                    </Button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Gallery & Description */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Gallery Carousel (Simplified for now) */}
                    <div className="relative aspect-[16/9] w-full rounded-[40px] overflow-hidden shadow-2xl group">
                        <Image
                            src={photos[0]}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                            <div className="space-y-2">
                                <Badge className="bg-primary hover:bg-primary text-white border-none px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest shadow-xl">
                                    {property.standard === 'alto' ? 'Alto Padrão' : property.standard === 'medio' ? 'Padrão Médio' : 'Econômico'}
                                </Badge>
                                <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
                                    {property.title}
                                </h1>
                                <p className="flex items-center gap-2 text-white/80 font-medium">
                                    <MapPin className="h-4 w-4" /> {property.neighborhood}, {property.city}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Preço Sugerido</p>
                                <p className="text-4xl font-black text-white tracking-tighter">
                                    R$ {property.price ? Number(property.price).toLocaleString('pt-BR') : 'Consulte'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Specs Bento Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Área Total", val: `${property.areaSqm}m²`, icon: Maximize2, desc: "Espaço total" },
                            { label: "Quartos", val: property.bedrooms, icon: BedDouble, desc: "Dormitórios" },
                            { label: "Vagas", val: property.parkingSpots, icon: Car, desc: "Estacionamento" },
                            { label: "Tipo", val: property.type, icon: Building, desc: "Categoria" },
                        ].map((spec, i) => (
                            <div key={i} className="card-premium p-6 flex flex-col gap-3 group hover:border-primary/30 transition-all">
                                <spec.icon className="h-5 w-5 text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{spec.label}</p>
                                    <p className="text-xl font-bold tracking-tight text-foreground">{spec.val || '-'}</p>
                                </div>
                                <p className="text-[9px] text-muted-foreground italic font-medium opacity-50">{spec.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-foreground opacity-80">Sobre o Imóvel</h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-muted-foreground leading-relaxed font-medium">
                                {property.description || "Este imóvel não possui uma descrição formal ainda, mas nossa IA pode gerar uma apresentação exclusiva para você enviar aos seus leads."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Financial & Actions */}
                <div className="space-y-8">
                    {/* Financial Summary Card */}
                    <div className="card-premium p-8 space-y-8 bg-muted/10 border-border/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <DollarSign className="h-32 w-32 rotate-12" />
                        </div>

                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Resumo Financeiro</h3>

                        <div className="space-y-6 relative z-10">
                            {/* Down Payment Card */}
                            <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/10 group hover:border-accent/30 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-inner">
                                    <HandCoins className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entrada Mínima</p>
                                    <p className="text-lg font-bold">R$ {property.downPayment ? Number(property.downPayment).toLocaleString('pt-BR') : 'Sob consulta'}</p>
                                </div>
                            </div>

                            {/* Condo Fee Card */}
                            {property.isCondo && (
                                <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/10 group hover:border-purple/30 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-purple/20 flex items-center justify-center text-purple shadow-inner">
                                        <Building className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Taxa Condomínio</p>
                                        <p className="text-lg font-bold">R$ {property.condoFee ? Number(property.condoFee).toLocaleString('pt-BR') : '0,00'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Indicators Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={cn(
                                    "p-4 rounded-xl border flex flex-col gap-2 transition-all",
                                    property.minhaCasaMinhaVida ? "bg-success/10 border-success/30" : "bg-muted/30 border-border/50 grayscale opacity-50"
                                )}>
                                    <ShieldCheck className={cn("h-4 w-4", property.minhaCasaMinhaVida ? "text-success" : "text-muted-foreground")} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">MCMV</span>
                                </div>
                                <div className={cn(
                                    "p-4 rounded-xl border flex flex-col gap-2 transition-all",
                                    property.allowsFinancing ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border/50 grayscale opacity-50"
                                )}>
                                    <CreditCard className={cn("h-4 w-4", property.allowsFinancing ? "text-primary" : "text-muted-foreground")} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Financiável</span>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full h-16 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition-all">
                            Compartilhar Vitrine
                        </Button>
                    </div>

                    {/* Extra Info Card */}
                    <div className="card-premium p-8 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Localização Exata</h4>
                        <p className="text-sm font-bold text-foreground leading-relaxed">
                            {property.address || "Endereço completo disponível sob solicitação ao corretor."}
                        </p>
                        <div className="aspect-video w-full rounded-2xl bg-muted/20 flex flex-col items-center justify-center gap-3 border border-dashed border-border/50">
                            <MapPin className="h-8 w-8 text-muted-foreground/30" />
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/40">Mapa indisponível</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
