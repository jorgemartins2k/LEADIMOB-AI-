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
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Gallery & Description */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Hero Section Card */}
                    <div className="relative aspect-[16/9] w-full rounded-[40px] overflow-hidden shadow-2xl group">
                        <Image
                            src={photos[0]}
                            alt={launch.name}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                        <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
                            <div className="space-y-3">
                                <Badge className={cn("border-none px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest shadow-xl", currentStatus.bg, currentStatus.color)}>
                                    <currentStatus.icon className="h-3 w-3 mr-2" />
                                    {currentStatus.label}
                                </Badge>
                                <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
                                    {launch.name}
                                </h1>
                                <p className="flex items-center gap-2 text-white/80 font-bold uppercase text-[10px] tracking-widest">
                                    <MapPin className="h-4 w-4 text-accent" /> {launch.neighborhood}, {launch.city}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Valores a partir de</p>
                                <p className="text-5xl font-black text-white tracking-tighter shadow-black">
                                    R$ {launch.priceFrom ? Number(launch.priceFrom).toLocaleString('pt-BR') : 'Consulte'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Technical Specs Bento */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Incorporadora", val: launch.developer || 'Premium', icon: Building2 },
                            { label: "Padrão", val: launch.standard, icon: ShieldCheck, isBadge: true },
                            { label: "Público", val: launch.targetAudience?.[0] || 'Todos', icon: Users },
                            { label: "Entrega", val: launch.deliveryDate ? new Date(launch.deliveryDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Em breve', icon: Calendar },
                        ].map((spec, i) => (
                            <div key={i} className="card-premium p-6 flex flex-col gap-3 group hover:border-accent/30 transition-all">
                                <spec.icon className="h-5 w-5 text-accent opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{spec.label}</p>
                                    <p className="text-lg font-bold tracking-tight text-foreground capitalize truncate">{spec.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Description Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-border flex-1" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">Conceito do Empreendimento</h2>
                            <div className="h-px bg-border flex-1" />
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                {launch.description || `O ${launch.name} representa uma nova era de sofisticação em ${launch.city}. Com design arrojado e localização estratégica em ${launch.neighborhood}, este empreendimento foi desenhado para quem não abre mão de qualidade de vida e potencial de valorização.`}
                            </p>
                        </div>
                    </div>

                    {/* Units / Plantas Section */}
                    {launch.units && launch.units.length > 0 && (
                        <div className="space-y-8 pt-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Plantas & Tipologias</h2>
                                <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black uppercase">{launch.units.length} opções</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                <div className="absolute top-4 right-4">
                                                    <Badge className="bg-white/90 text-black border-none font-black text-[9px] uppercase tracking-widest shadow-2xl">
                                                        {unit.areaSqm}m²
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="p-8 space-y-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-xl font-black tracking-tight">{unit.name}</h4>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                                            {unit.bedrooms} Quartos • {unit.parkingSpots} Vagas
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-[8px] font-black text-muted-foreground uppercase tracking-widest">Valor da Unidade</span>
                                                        <span className="text-lg font-black text-accent">R$ {unit.price ? Number(unit.price).toLocaleString('pt-BR') : 'Consulte'}</span>
                                                    </div>
                                                </div>

                                                {unit.targetAudience && unit.targetAudience.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {unit.targetAudience.map((ta: string) => (
                                                            <Badge key={ta} variant="secondary" className="text-[8px] font-bold uppercase tracking-tighter bg-accent/5 text-accent border-accent/20">
                                                                {ta}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex gap-4 pt-2">
                                                    <div className={cn("p-2 rounded-lg border text-[9px] font-black uppercase tracking-tighter", unit.minhaCasaMinhaVida ? "border-success/30 text-success" : "border-border/50 text-muted-foreground opacity-30")}>MCMV</div>
                                                    <div className={cn("p-2 rounded-lg border text-[9px] font-black uppercase tracking-tighter", unit.allowsFinancing ? "border-accent/30 text-accent" : "border-border/50 text-muted-foreground opacity-30")}>Financiável</div>
                                                </div>

                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className="w-full h-12 rounded-xl border-border/50 font-black uppercase text-[10px] tracking-widest gap-2 group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all duration-300">
                                                        Ver Detalhes da Planta <MoveRight className="h-3 w-3" />
                                                    </Button>
                                                </DialogTrigger>
                                            </div>
                                        </div>

                                        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-2xl rounded-[40px]">
                                            <div className="bg-card border border-white/10 rounded-[40px] overflow-hidden flex flex-col md:flex-row h-full md:h-[600px]">
                                                <div className="relative flex-1 bg-muted/20 h-[300px] md:h-full">
                                                    <Image
                                                        src={unit.photo || photos[0]}
                                                        alt={unit.name}
                                                        fill
                                                        className="object-contain p-8"
                                                    />
                                                </div>
                                                <div className="w-full md:w-[400px] p-10 flex flex-col justify-center space-y-8 bg-card relative z-10">
                                                    <div className="space-y-4">
                                                        <Badge className="bg-accent/10 text-accent border-none font-black text-[10px] uppercase tracking-widest">
                                                            Detalhes da Unidade
                                                        </Badge>
                                                        <h3 className="text-4xl font-black tracking-tighter leading-none">{unit.name}</h3>
                                                        <p className="text-muted-foreground text-sm font-medium">{launch.name} • {launch.neighborhood}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-6 border-y border-border/50 py-8">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Área Total</p>
                                                            <p className="text-xl font-bold">{unit.areaSqm}m²</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Valor</p>
                                                            <p className="text-xl font-bold text-accent">R$ {unit.price ? Number(unit.price).toLocaleString('pt-BR') : 'Consulte'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Quartos</p>
                                                            <p className="text-xl font-bold">{unit.bedrooms}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Vagas</p>
                                                            <p className="text-xl font-bold">{unit.parkingSpots}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Financiamento</p>
                                                        <div className="flex gap-4">
                                                            {unit.minhaCasaMinhaVida && (
                                                                <div className="flex items-center gap-2 text-success font-bold text-sm">
                                                                    <ShieldCheck className="h-4 w-4" /> MCMV Ativo
                                                                </div>
                                                            )}
                                                            {unit.allowsFinancing && (
                                                                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                                                    <CreditCard className="h-4 w-4" /> Financiável
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Button className="w-full h-16 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all">
                                                        Solicitar Proposta
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
                <div className="space-y-8">
                    {/* Financial Summary Preview */}
                    <div className="card-premium p-8 space-y-8 bg-muted/10 border-border/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <DollarSign className="h-32 w-32 rotate-12" />
                        </div>

                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent">Resumo do Investimento</h3>

                        <div className="space-y-6 relative z-10">
                            {/* Min Price Card */}
                            <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/10 group hover:border-accent/30 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-inner">
                                    <HandCoins className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entrada Estimada</p>
                                    <p className="text-lg font-bold">R$ {launch.priceFrom ? (Number(launch.priceFrom) * 0.1).toLocaleString('pt-BR') : 'Consulte'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Card with Map */}
                    <div className="card-premium p-8 space-y-6">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Localização</h4>
                            <p className="text-lg font-bold text-foreground leading-tight mt-1">
                                {launch.neighborhood}, {launch.city}
                            </p>
                        </div>

                        <PropertyMap
                            address={launch.neighborhood}
                            neighborhood={launch.neighborhood}
                            city={launch.city}
                        />

                        <div className="space-y-2 pt-2">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60 italic">
                                * Localização aproximada do Stand de Vendas
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
