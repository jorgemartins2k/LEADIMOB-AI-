import { getPropertyById } from "@/lib/actions/properties";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
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
import { PropertyMap } from "@/components/properties/property-map";

interface PropertyDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
    const { id } = await params;
    const property = await getPropertyById(id);

    if (!property) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold">Imóvel não encontrado</h2>
                <p className="text-muted-foreground">O imóvel que você está procurando não existe ou foi removido.</p>
                <Link href="/imoveis">
                    <Button variant="outline">Voltar para Portfólio</Button>
                </Link>
            </div>
        )
    }

    const photos = Array.isArray(property?.photos) && property.photos.length > 0
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
                        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div className="space-y-2">
                                    <Badge className="bg-primary hover:bg-primary text-white border-none px-4 py-1.5 rounded-full text-[9px] md:text-[10px] uppercase font-bold tracking-widest shadow-xl">
                                        {property.standard === 'alto' ? 'Alto Padrão' : property.standard === 'medio' ? 'Padrão Médio' : 'Econômico'}
                                    </Badge>
                                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md">
                                        {property.title}
                                    </h1>
                                    <p className="flex items-center gap-2 text-white/80 font-medium text-xs md:text-sm">
                                        <MapPin className="h-4 w-4" /> {property.neighborhood}, {property.city}
                                    </p>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Preço Sugerido</p>
                                    <p className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                                        R$ {property.price ? Number(property.price).toLocaleString('pt-BR') : 'Consulte'}
                                    </p>
                                </div>
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
                            <div key={i} className="card-premium p-4 md:p-6 flex flex-col gap-2 md:gap-3 group hover:border-primary/30 transition-all">
                                <spec.icon className="h-4 w-4 md:h-5 md:w-5 text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                <div className="space-y-0.5">
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">{spec.label}</p>
                                    <p className="text-lg md:text-xl font-bold tracking-tight text-foreground">{spec.val || '-'}</p>
                                </div>
                                <p className="text-[8px] md:text-[9px] text-muted-foreground italic font-medium opacity-50">{spec.desc}</p>
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

                    </div>

                    {/* Extra Info Card */}
                    <div className="card-premium p-8 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Localização Exata</h4>
                        <p className="text-sm font-bold text-foreground leading-relaxed">
                            {property.address || "Endereço completo disponível sob solicitação ao corretor."}
                        </p>
                        <PropertyMap
                            address={property.address}
                            neighborhood={property.neighborhood}
                            city={property.city}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
