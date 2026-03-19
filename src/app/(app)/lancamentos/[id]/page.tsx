import { getLaunchById } from "@/lib/actions/launches";
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
    Rocket,
    Construction,
    Calendar,
    Building2,
    Users,
    ShieldCheck,
    CreditCard,
    HandCoins,
    DollarSign,
    MoveRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { PropertyMap } from "@/components/properties/property-map";
import { PropertyGallery } from "@/components/properties/property-gallery";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface LaunchDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function LaunchDetailsPage({ params }: LaunchDetailsPageProps) {
    const { id } = await params;
    const launch = await getLaunchById(id);

    if (!launch) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold">Lançamento não encontrado</h2>
                <p className="text-muted-foreground">O empreendimento que você está procurando não existe ou foi removido.</p>
                <Link href="/lancamentos">
                    <Button variant="outline">Voltar para Lançamentos</Button>
                </Link>
            </div>
        )
    }

    const photos = Array.isArray(launch?.photos) && launch.photos.length > 0
        ? launch.photos
        : ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop"];

    const statusMap = {
        pre_launch: { label: "Pré-Lançamento", icon: Rocket, color: "text-blue-500", bg: "bg-blue-500/10" },
        launch: { label: "Em Lançamento", icon: Rocket, color: "text-accent", bg: "bg-accent/10" },
        under_construction: { label: "Em Construção", icon: Construction, color: "text-purple-500", bg: "bg-purple-500/10" },
    };

    const currentStatus = statusMap[launch.status as keyof typeof statusMap] || statusMap.launch;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <Link href="/lancamentos">
                    <Button variant="ghost" className="gap-2 rounded-2xl hover:bg-muted transition-all">
                        <ChevronLeft className="h-4 w-4" /> Voltar para Lançamentos
                    </Button>
                </Link>
                <div className="flex gap-3">
                    <Link href={`/lancamentos/${launch.id}/editar`}>
                        <Button variant="outline" className="gap-2 rounded-2xl border-accent/20 text-accent hover:bg-accent/5 font-bold uppercase tracking-widest text-[10px] btn-interactive">
                            Editar Lançamento
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 px-1 sm:px-0">
                {/* Left: Gallery & Description */}
                <div className="lg:col-span-2 space-y-10 sm:space-y-12">
                    {/* Gallery Carousel */}
                    <div className="space-y-6 sm:space-y-8">
                        <PropertyGallery images={photos} title={launch.name} />

                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2 sm:px-0">
                            <div className="space-y-1.5 sm:space-y-3">
                                <Badge className={cn("border-none px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] uppercase font-black tracking-widest shadow-xl", currentStatus.bg, currentStatus.color)}>
                                    <currentStatus.icon className="h-3 w-3 mr-2" />
                                    {currentStatus.label}
                                </Badge>
                                <h1 className="text-2xl sm:text-5xl font-black text-foreground tracking-tighter line-clamp-2">
                                    {launch.name}
                                </h1>
                                <p className="flex items-center gap-1.5 text-muted-foreground font-bold uppercase text-[9px] sm:text-[10px] tracking-widest">
                                    <MapPin className="h-3.5 w-3.5 text-accent" /> {launch.neighborhood}, {launch.city}
                                </p>
                            </div>
                            <div className="text-left sm:text-right shrink-0">
                                <p className="text-muted-foreground text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-0.5 sm:mb-1">Valores a partir de</p>
                                <p className="text-2xl sm:text-5xl font-black text-primary tracking-tighter">
                                    R$ {launch.priceFrom ? Number(launch.priceFrom).toLocaleString('pt-BR') : 'Consulte'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Technical Specs Bento */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            { label: "Incorporadora", val: launch.developer || 'Premium', icon: Building2 },
                            { label: "Padrão", val: launch.standard, icon: ShieldCheck, isBadge: true },
                            { label: "Público", val: launch.targetAudience?.[0] || 'Todos', icon: Users },
                            { label: "Entrega", val: launch.deliveryDate ? new Date(launch.deliveryDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Em breve', icon: Calendar },
                        ].map((spec, i) => (
                            <div key={i} className="card-premium p-4 sm:p-6 flex flex-col gap-2 sm:gap-3 group hover:border-accent/30 transition-all">
                                <spec.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-accent opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                <div className="space-y-0.5">
                                    <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{spec.label}</p>
                                    <p className="text-sm sm:text-lg font-black tracking-tight text-foreground capitalize truncate">{spec.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Description Section */}
                    <div className="space-y-6 px-1">
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-border flex-1" />
                            <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground whitespace-nowrap opacity-60">Conceito</h2>
                            <div className="h-px bg-border flex-1" />
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed font-medium opacity-90 text-justify sm:text-left">
                                {launch.description || `O ${launch.name} representa uma nova era de sofisticação em ${launch.city}. Com design arrojado e localização estratégica em ${launch.neighborhood}, este empreendimento foi desenhado para quem não abre mão de qualidade de vida e potencial de valorização.`}
                            </p>
                        </div>
                    </div>

                    {/* Units / Plantas Section */}
                    {launch.units && launch.units.length > 0 && (
                        <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6">
                            <div className="flex items-center justify-between border-l-4 border-accent pl-4">
                                <div className="space-y-0.5">
                                    <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tighter">Plantas & Tipologias</h2>
                                    <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Configurações disponíveis</p>
                                </div>
                                <Badge variant="outline" className="rounded-full px-3 sm:px-4 py-1 text-[8px] sm:text-[10px] font-black uppercase">{launch.units.length} opções</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                {launch.units.map((unit: any) => (
                                    <Dialog key={unit.id}>
                                        <div className="card-premium p-0 overflow-hidden flex flex-col group hover:border-accent/50 transition-all duration-500">
                                            <div className="relative aspect-video w-full">
                                                <Image
                                                    src={unit.photo || photos[0]}
                                                    alt={unit.name}
                                                    fill
                                                    className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                                                />
                                                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                                                    <Badge className="bg-white/95 text-black border-none font-black text-[8px] sm:text-[10px] uppercase tracking-widest shadow-2xl px-2.5 sm:px-3 py-1">
                                                        {unit.areaSqm}m²
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="p-6 sm:p-8 space-y-5 sm:space-y-6 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="space-y-1">
                                                        <h4 className="text-lg sm:text-xl font-black tracking-tight">{unit.name}</h4>
                                                        <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                                            {unit.areaSqm}m² • {unit.bedrooms} Dorms • {unit.parkingSpots} Vagas
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <span className="block text-[6px] sm:text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Unidades</span>
                                                        <span className="text-sm sm:text-lg font-black text-accent tracking-tighter">R$ {unit.price ? Number(unit.price).toLocaleString('pt-BR') : 'Consulte'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 sm:gap-4 pt-1 mt-auto">
                                                    <div className={cn("px-2.5 py-1.5 rounded-lg border text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all", unit.minhaCasaMinhaVida ? "bg-success/10 border-success/30 text-success" : "bg-muted/10 border-border/50 text-muted-foreground opacity-30")}>
                                                        {unit.minhaCasaMinhaVida && <ShieldCheck className="h-3 w-3" />} MCMV
                                                    </div>
                                                    <div className={cn("px-2.5 py-1.5 rounded-lg border text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all", unit.allowsFinancing ? "bg-accent/10 border-accent/20 text-accent" : "bg-muted/10 border-border/50 text-muted-foreground opacity-30")}>
                                                        {unit.allowsFinancing && <CreditCard className="h-3 w-3" />} Financiável
                                                    </div>
                                                </div>

                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className="w-full h-12 rounded-xl border-border/50 font-black uppercase text-[9px] sm:text-[10px] tracking-widest gap-2 sm:gap-3 group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all duration-300">
                                                        Detalhes da Planta <MoveRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DialogTrigger>
                                            </div>
                                        </div>

                                        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-2xl sm:rounded-[40px]">
                                            <div className="bg-card border border-white/10 rounded-[28px] sm:rounded-[40px] overflow-hidden flex flex-col md:flex-row h-full md:h-[600px] mx-4 sm:mx-0">
                                                <div className="relative flex-1 bg-muted/20 h-[280px] sm:h-[350px] md:h-full">
                                                    <Image
                                                        src={unit.photo || photos[0]}
                                                        alt={unit.name}
                                                        fill
                                                        className="object-contain p-6 sm:p-10"
                                                    />
                                                </div>
                                                <div className="w-full md:w-[400px] p-8 sm:p-12 flex flex-col justify-center space-y-6 sm:space-y-8 bg-card relative z-10 border-t md:border-t-0 md:border-l border-border/50">
                                                    <div className="space-y-3 sm:space-y-4 text-center md:text-left">
                                                        <Badge className="bg-accent/15 text-accent border-none font-black text-[8px] sm:text-[10px] uppercase tracking-widest px-3 py-1">
                                                            Informações Técnicas
                                                        </Badge>
                                                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">{unit.name}</h3>
                                                        <p className="text-muted-foreground text-xs sm:text-sm font-bold uppercase tracking-widest opacity-60">Padrão {launch.standard}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-5 sm:gap-8 border-y border-border/50 py-6 sm:py-10">
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Área Privativa</p>
                                                            <p className="text-lg sm:text-2xl font-black tracking-tighter">{unit.areaSqm}m²</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Investimento</p>
                                                            <p className="text-lg sm:text-2xl font-black text-accent tracking-tighter">R$ {unit.price ? Number(unit.price).toLocaleString('pt-BR') : 'Consulte'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Dormitórios</p>
                                                            <p className="text-lg sm:text-2xl font-black tracking-tighter">{unit.bedrooms}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Vagas</p>
                                                            <p className="text-lg sm:text-2xl font-black tracking-tighter">{unit.parkingSpots}</p>
                                                        </div>
                                                    </div>

                                                    <Button className="w-full h-14 sm:h-18 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[9px] sm:text-[11px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                                                        Solicitar Material Completo
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Technical & Location */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Financial Summary Preview */}
                    <div className="card-premium p-6 sm:p-8 space-y-6 sm:space-y-8 bg-muted/10 border-border/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                            <DollarSign className="h-24 w-24 sm:h-32 sm:w-32 rotate-12" />
                        </div>

                        <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-accent">Análise de Investimento</h3>

                        <div className="space-y-5 sm:space-y-6 relative z-10">
                            {/* Min Price Card */}
                            <div className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 group hover:border-accent/30 transition-all">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-inner flex-shrink-0">
                                    <HandCoins className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                                <div>
                                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Entrada Média</p>
                                    <p className="text-base sm:text-lg font-black tracking-tight">R$ {launch.priceFrom ? (Number(launch.priceFrom) * 0.1).toLocaleString('pt-BR') : 'Consulte'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Website Link Card */}
                    {launch.websiteUrl && (
                        <div className="card-premium p-6 sm:p-8 space-y-4 sm:space-y-6">
                            <h4 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Link do Corretor</h4>
                            <p className="text-xs sm:text-sm font-bold text-foreground leading-relaxed">
                                Acesse a página original deste lançamento no site ou marketplace.
                            </p>
                            <a href={launch.websiteUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                                <Button className="w-full h-12 sm:h-14 rounded-xl bg-accent text-white font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-accent/20">
                                    Acessar Página Original
                                </Button>
                            </a>
                        </div>
                    )}

                    {/* Location Card with Map */}
                    <div className="card-premium p-6 sm:p-8 space-y-4 sm:space-y-6">
                        <div className="border-l-4 border-accent pl-4">
                            <h4 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Localização</h4>
                            <p className="text-sm sm:text-lg font-black text-foreground leading-tight mt-1">
                                {launch.neighborhood}, {launch.city}
                            </p>
                        </div>

                        <div className="rounded-2xl overflow-hidden border border-border/40 shadow-inner">
                            <PropertyMap
                                address={launch.neighborhood}
                                neighborhood={launch.neighborhood}
                                city={launch.city}
                            />
                        </div>

                        <div className="space-y-2 pt-1 opacity-40">
                            <p className="text-[7px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest italic flex items-center gap-1.5">
                                <MapPin className="h-2.5 w-2.5" /> Stand de Vendas Aproximado
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
