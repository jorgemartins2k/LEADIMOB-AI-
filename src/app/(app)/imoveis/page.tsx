"use client";

import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import { Plus, Search, Filter, Home, MapPin, Maximize2, BedDouble, Car, ChevronRight, X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getProperties, deleteProperty } from "@/lib/actions/properties";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function PropertiesPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        type: "all",
        standard: "all",
        minBedrooms: 0,
        minPrice: 0,
        maxPrice: Infinity,
        mcmv: false,
    });
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Delete state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState<{ id: string, title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const data = await getProperties();
                setProperties(data);
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const confirmDelete = (e: React.MouseEvent, id: string, title: string) => {
        e.preventDefault();
        e.stopPropagation();
        setPropertyToDelete({ id, title });
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!propertyToDelete) return;
        setIsDeleting(true);
        try {
            const result = await deleteProperty(propertyToDelete.id);
            if (result.success) {
                toast.success(`Imóvel "${propertyToDelete.title}" excluído com sucesso.`);
                setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
                setIsDeleteDialogOpen(false);
            } else {
                toast.error("Erro ao excluir imóvel.");
            }
        } catch (error) {
            toast.error("Erro ao excluir imóvel.");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredProperties = properties.filter(p => {
        const matchesSearch =
            p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filters.type === "all" || p.type === filters.type;
        const matchesStandard = filters.standard === "all" || p.standard === filters.standard;
        const matchesBedrooms = (p.bedrooms || 0) >= filters.minBedrooms;
        const matchesPrice = Number(p.price || 0) >= filters.minPrice && Number(p.price || 0) <= filters.maxPrice;
        const matchesMCMV = !filters.mcmv || p.minhaCasaMinhaVida === true;

        return matchesSearch && matchesType && matchesStandard && matchesBedrooms && matchesPrice && matchesMCMV;
    });

    const activeFiltersCount = [
        filters.type !== "all",
        filters.standard !== "all",
        filters.minBedrooms > 0,
        filters.maxPrice !== Infinity,
        filters.mcmv
    ].filter(Boolean).length;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-[40px] lg:text-[48px] font-bold tracking-tight text-foreground">Gestão de <span className="text-gradient-accent">Portfólio</span></h1>
                    <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed">Organize e disponibilize seus imóveis para a <span className="text-foreground font-semibold">Raquel</span> oferecer via WhatsApp.</p>
                </div>
                <Button className="btn-primary h-16 px-10 font-semibold uppercase text-[10px] tracking-wider gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all" asChild>
                    <Link href="/imoveis/novo">
                        <Plus className="h-5 w-5" /> Adicionar Imóvel
                    </Link>
                </Button>
            </div>

            {/* Stats/Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { l: "Total Ativos", v: properties.length, c: "text-primary" },
                    { l: "Alto Padrão", v: properties.filter(p => p.standard === 'alto').length, c: "text-accent" },
                    { l: "Média Preço", v: properties.length > 0 ? `R$ ${(properties.reduce((acc, p) => acc + Number(p.price), 0) / properties.length / 1000).toFixed(0)}k` : '-', c: "text-purple" },
                    { l: "MCMV", v: properties.filter(p => p.minhaCasaMinhaVida).length, c: "text-success" },
                ].map((s, i) => (
                    <div key={i} className="card-premium p-4 md:p-6 flex flex-col gap-2 md:gap-3">
                        <span className="text-[8px] md:text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{s.l}</span>
                        <span className={cn("text-2xl md:text-3xl font-bold tracking-tighter", s.c)}>{s.v}</span>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="card-premium p-4 flex-1 flex items-center gap-4 bg-muted/20">
                    <Search className="w-5 h-5 text-muted-foreground ml-2" />
                    <Input
                        placeholder="Buscar por código, rua ou condomínio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none h-10 font-bold focus-visible:ring-0 placeholder:opacity-50"
                    />
                </div>
                <Button
                    variant="outline"
                    className={cn(
                        "h-14 md:h-[74px] px-6 md:px-8 rounded-[20px] md:rounded-[24px] border-border/50 gap-3 btn-interactive relative",
                        activeFiltersCount > 0 && "border-accent bg-accent/5 text-accent"
                    )}
                    onClick={() => setIsFilterModalOpen(true)}
                >
                    <Filter className="w-4 h-4" />
                    Filtros Avançados
                    {activeFiltersCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full bg-accent text-white border-white animate-in zoom-in">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Marketplace Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[450px] rounded-[40px] bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProperties.map((property) => (
                        <Link key={property.id} href={`/imoveis/${property.id}`} className="group h-full flex flex-col">
                            <div className="card-premium overflow-hidden flex flex-col h-full hover:border-accent/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/5">
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                    <Image
                                        src={property.photos?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop"}
                                        alt={property.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <Badge className="bg-white/90 text-black border-none font-black text-[8px] px-3 py-1 uppercase rounded-full shadow-lg">
                                            {property.type}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => confirmDelete(e, property.id, property.title)}
                                            className="h-8 w-8 rounded-full bg-white/90 text-destructive hover:bg-destructive hover:text-white transition-all shadow-xl"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-4 left-4 flex gap-2">
                                        {property.minhaCasaMinhaVida && (
                                            <div className="w-8 h-8 rounded-full bg-success/90 text-white flex items-center justify-center shadow-lg border border-white/20">
                                                <Home className="h-4 w-4" />
                                            </div>
                                        )}
                                        {property.allowsFinancing && (
                                            <div className="w-8 h-8 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg border border-white/20">
                                                <Car className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 md:p-8 space-y-4 md:space-y-6 flex-1 flex flex-col">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors line-clamp-1">
                                                {property.title}
                                            </h3>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1" />
                                        </div>
                                        <p className="flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground font-medium italic opacity-70">
                                            <MapPin className="h-3 w-3" /> {property.neighborhood}, {property.city}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between border-y border-border/50 py-4 md:py-5">
                                        <div className="flex flex-col gap-0.5 md:gap-1">
                                            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Área</span>
                                            <p className="text-xs md:text-sm font-bold flex items-center gap-1 md:gap-1.5">
                                                <Maximize2 className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary" /> {property.areaSqm}m²
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-0.5 md:gap-1 items-center">
                                            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Dorms</span>
                                            <p className="text-xs md:text-sm font-bold flex items-center gap-1 md:gap-1.5">
                                                <BedDouble className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary" /> {property.bedrooms}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-0.5 md:gap-1 items-end">
                                            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Vagas</span>
                                            <p className="text-xs md:text-sm font-bold flex items-center gap-1 md:gap-1.5">
                                                <Car className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary" /> {property.parkingSpots}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-1 md:pt-2 flex justify-between items-end mt-auto">
                                        <div className="space-y-0.5 md:space-y-1">
                                            <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-accent">Valor Total</p>
                                            <p className="text-xl md:text-2xl font-black text-foreground tracking-tighter">
                                                R$ {Number(property.price).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="rounded-full border-border/50 text-[8px] md:text-[9px] font-bold px-2 md:px-3">
                                                {property.standard}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 rounded-[56px] border-4 border-dashed border-muted/50 bg-muted/5 group hover:border-accent/20 transition-all duration-700 relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="w-24 h-24 rounded-3xl bg-muted/30 flex items-center justify-center mb-10 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                            <Home className="h-12 w-12 text-muted-foreground opacity-40" />
                        </div>
                        <h3 className="text-3xl font-bold text-foreground uppercase tracking-tight mb-4">Portfólio em Branco</h3>
                        <p className="text-muted-foreground font-normal max-w-sm mx-auto text-sm mb-12 opacity-60 leading-relaxed">
                            Ainda não há imóveis que correspondam à sua busca. Comece cadastrando suas melhores oportunidades.
                        </p>
                        <Button className="btn-primary px-12 h-16 rounded-[24px] shadow-2xl transition-all font-semibold uppercase text-[10px] tracking-wider" asChild>
                            <Link href="/imoveis/novo">
                                <Plus className="h-5 w-5 mr-3" /> Cadastrar Novo Imóvel
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
            {/* Advanced Filters Modal */}
            <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-2xl">
                    <div className="relative bg-card/90 backdrop-blur-2xl border border-white/10 rounded-[40px] overflow-hidden p-10">
                        <DialogHeader className="mb-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">Filtros Avançados</DialogTitle>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Refine sua busca no portfólio</p>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Tipo de Imóvel</Label>
                                <Select value={filters.type} onValueChange={(v) => setFilters(f => ({ ...f, type: v }))}>
                                    <SelectTrigger className="w-full h-14 rounded-2xl border-border/50 bg-muted/20 font-bold">
                                        <SelectValue placeholder="Todos os tipos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os tipos</SelectItem>
                                        <SelectItem value="apartamento">Apartamento</SelectItem>
                                        <SelectItem value="casa">Casa</SelectItem>
                                        <SelectItem value="terreno">Terreno</SelectItem>
                                        <SelectItem value="comercial">Comercial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Padrão</Label>
                                <Select value={filters.standard} onValueChange={(v) => setFilters(f => ({ ...f, standard: v }))}>
                                    <SelectTrigger className="w-full h-14 rounded-2xl border-border/50 bg-muted/20 font-bold">
                                        <SelectValue placeholder="Todos os padrões" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os padrões</SelectItem>
                                        <SelectItem value="economico">Econômico</SelectItem>
                                        <SelectItem value="medio">Médio Padrão</SelectItem>
                                        <SelectItem value="alto">Alto Padrão</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-6 md:col-span-2">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Faixa de Preço (Até)</Label>
                                    <span className="text-lg font-black text-accent tracking-tighter">
                                        {filters.maxPrice === Infinity ? "Qualquer valor" : `R$ ${filters.maxPrice.toLocaleString('pt-BR')}`}
                                    </span>
                                </div>
                                <Slider
                                    defaultValue={[0]}
                                    max={10000000}
                                    step={50000}
                                    onValueChange={(v) => setFilters(f => ({ ...f, maxPrice: v[0] === 0 ? Infinity : v[0] }))}
                                    className="py-4"
                                />
                            </div>

                            <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border/30 md:col-span-2">
                                <div className="space-y-1">
                                    <p className="font-bold text-foreground tracking-tight">Minha Casa Minha Vida</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Filtrar apenas imóveis MCMV</p>
                                </div>
                                <Switch
                                    checked={filters.mcmv}
                                    onCheckedChange={(v) => setFilters(f => ({ ...f, mcmv: v }))}
                                />
                            </div>
                        </div>

                        <DialogFooter className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFilters({
                                        type: "all",
                                        standard: "all",
                                        minBedrooms: 0,
                                        minPrice: 0,
                                        maxPrice: Infinity,
                                        mcmv: false,
                                    });
                                    setSearchTerm("");
                                }}
                                className="h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] text-muted-foreground border-border/50"
                            >
                                Limpar Tudo
                            </Button>
                            <Button
                                onClick={() => setIsFilterModalOpen(false)}
                                className="h-16 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all"
                            >
                                Aplicar Filtros
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

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
                                    Você está prestes a remover o imóvel <span className="text-foreground font-bold italic">"{propertyToDelete?.title}"</span>. Esta ação não poderá ser desfeita.
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
