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
import { PropertyGallery } from "@/components/properties/property-gallery";

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
                    <Link href={`/imoveis/${property.id}/editar`}>
                        <Button variant="outline" className="gap-2 rounded-2xl border-accent/20 text-accent hover:bg-accent/5 font-bold uppercase tracking-widest text-[10px] btn-interactive">
                            Editar Imóvel
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 px-1 sm:px-0">
                {/* Left: Gallery & Description */}
                <div className="lg:col-span-2 space-y-8 sm:space-y-10">
                    {/* Gallery Carousel */}
                    <div className="space-y-6">
                        <PropertyGallery images={photos} title={property.title} />

                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2 sm:px-4">
                            <div className="space-y-1.5 sm:space-y-2">
                                <Badge className="bg-primary hover:bg-primary text-white border-none px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] uppercase font-black tracking-widest shadow-xl">
                                    {property.standard === 'alto' ? 'Alto Padrão' : property.standard === 'medio' ? 'Padrão Médio' : 'Econômico'}
                                </Badge>
                                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight line-clamp-2">
                                    {property.title}
                                </h1>
                                <p className="flex items-center gap-1.5 text-muted-foreground font-bold text-[10px] sm:text-sm">
                                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" /> {property.neighborhood}, {property.city}
                                </p>
                            </div>
                            <div className="text-left sm:text-right shrink-0">
                                <p className="text-muted-foreground text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-0.5 sm:mb-1">Valor do Imóvel</p>
                                <p className="text-2xl sm:text-4xl font-black text-primary tracking-tighter">
                                    R$ {property.price ? Number(property.price).toLocaleString('pt-BR') : 'Consulte'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Specs Bento Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            { label: "Área Total", val: `${property.areaSqm}m²`, icon: Maximize2, desc: "Espaço total" },
                            { label: "Quartos", val: property.bedrooms, icon: BedDouble, desc: "Dormitórios" },
                            { label: "Vagas", val: property.parkingSpots, icon: Car, desc: "Estacionamento" },
                            { label: "Tipo", val: property.type, icon: Building, desc: "Categoria" },
                        ].map((spec, i) => (
                            <div key={i} className="card-premium p-4 sm:p-6 flex flex-col gap-2 sm:gap-3 group hover:border-primary/30 transition-all">
                                <spec.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all font-black" />
                                <div className="space-y-0.5">
                                    <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{spec.label}</p>
                                    <p className="text-base sm:text-xl font-black tracking-tight text-foreground">{spec.val || '-'}</p>
                                </div>
                                <p className="text-[7px] sm:text-[9px] text-muted-foreground italic font-medium opacity-40 hidden sm:block">{spec.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="space-y-4 px-1">
                        <h2 className="text-sm sm:text-xl font-black uppercase tracking-widest text-foreground opacity-80 border-l-4 border-accent pl-4">Sobre o Imóvel</h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium opacity-90">
                                {property.description || "Este imóvel não possui uma descrição formal ainda, mas nossa IA pode gerar uma apresentação exclusiva para você enviar aos seus leads."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Financial & Actions */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Financial Summary Card */}
                    <div className="card-premium p-6 sm:p-8 space-y-6 sm:space-y-8 bg-muted/10 border-border/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                            <DollarSign className="h-24 w-24 sm:h-32 sm:w-32 rotate-12" />
                        </div>

                        <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-primary">Resumo Financeiro</h3>

                        <div className="space-y-4 sm:space-y-6 relative z-10">
                            {/* Down Payment Card */}
                            <div className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 group hover:border-accent/30 transition-all">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-inner flex-shrink-0">
                                    <HandCoins className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                                <div>
                                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Entrada Mínima</p>
                                    <p className="text-base sm:text-lg font-black">R$ {property.downPayment ? Number(property.downPayment).toLocaleString('pt-BR') : 'Sob consulta'}</p>
                                </div>
                            </div>

                            {/* Condo Fee Card */}
                            {property.isCondo && (
                                <div className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 group hover:border-purple/30 transition-all">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple/20 flex items-center justify-center text-purple shadow-inner flex-shrink-0">
                                        <Building className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Taxa Condomínio</p>
                                        <p className="text-base sm:text-lg font-black">R$ {property.condoFee ? Number(property.condoFee).toLocaleString('pt-BR') : '0,00'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Indicators Grid */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className={cn(
                                    "p-3 sm:p-4 rounded-xl border flex flex-col gap-1.5 sm:gap-2 transition-all",
                                    property.minhaCasaMinhaVida ? "bg-success/10 border-success/30" : "bg-muted/30 border-border/50 grayscale opacity-40"
                                )}>
                                    <ShieldCheck className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", property.minhaCasaMinhaVida ? "text-success" : "text-muted-foreground")} />
                                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">MCMV</span>
                                </div>
                                <div className={cn(
                                    "p-3 sm:p-4 rounded-xl border flex flex-col gap-1.5 sm:gap-2 transition-all",
                                    property.allowsFinancing ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border/50 grayscale opacity-40"
                                )}>
                                    <CreditCard className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", property.allowsFinancing ? "text-primary" : "text-muted-foreground")} />
                                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Financiável</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Website Link Card */}
                    {property.websiteUrl && (
                        <div className="card-premium p-6 sm:p-8 space-y-4 sm:space-y-6">
                            <h4 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Link do Corretor</h4>
                            <p className="text-xs sm:text-sm font-bold text-foreground leading-relaxed">
                                Acesse a página original deste imóvel no site ou marketplace.
                            </p>
                            <a href={property.websiteUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                                <Button className="w-full h-12 sm:h-14 rounded-xl bg-accent text-white font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-accent/20">
                                    Acessar Página Original
                                </Button>
                            </a>
                        </div>
                    )}

                    {/* Extra Info Card */}
                    <div className="card-premium p-6 sm:p-8 space-y-4 sm:space-y-6">
                        <h4 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Localização Exata</h4>
                        <p className="text-xs sm:text-sm font-bold text-foreground leading-relaxed">
                            {property.address || "Endereço completo disponível sob solicitação ao corretor."}
                        </p>
                        <div className="rounded-2xl overflow-hidden border border-border/40 shadow-inner">
                            <PropertyMap
                                address={property.address}
                                neighborhood={property.neighborhood}
                                city={property.city}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
