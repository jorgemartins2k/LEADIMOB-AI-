"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Home, MapPin, Maximize2, BedDouble, Car, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getProperties } from "@/lib/actions/properties";

export default function PropertiesPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

    const filteredProperties = properties.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="heading-xl text-foreground">Gestão de <span className="text-gradient-accent">Portfólio</span></h1>
                    <p className="text-body font-normal leading-relaxed">Organize e disponibilize seus imóveis para a <span className="text-foreground font-semibold">Raquel</span> oferecer via WhatsApp.</p>
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
                    <div key={i} className="card-premium p-6 flex flex-col gap-3">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{s.l}</span>
                        <span className={cn("text-3xl font-bold tracking-tighter", s.c)}>{s.v}</span>
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
                <Button variant="outline" className="h-[74px] px-8 rounded-[24px] border-border/50 gap-3 btn-interactive">
                    <Filter className="w-4 h-4" /> Filtros Avançados
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
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-white/90 text-black border-none font-black text-[8px] px-3 py-1 uppercase rounded-full shadow-lg">
                                            {property.type}
                                        </Badge>
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
                                <div className="p-8 space-y-6 flex-1 flex flex-col">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors line-clamp-1">
                                                {property.title}
                                            </h3>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1" />
                                        </div>
                                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium italic opacity-70">
                                            <MapPin className="h-3 w-3" /> {property.neighborhood}, {property.city}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between border-y border-border/50 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Área</span>
                                            <p className="text-sm font-bold flex items-center gap-1.5">
                                                <Maximize2 className="h-3 w-3 text-primary" /> {property.areaSqm}m²
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 items-center">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Dorms</span>
                                            <p className="text-sm font-bold flex items-center gap-1.5">
                                                <BedDouble className="h-3 w-3 text-primary" /> {property.bedrooms}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Vagas</span>
                                            <p className="text-sm font-bold flex items-center gap-1.5">
                                                <Car className="h-3 w-3 text-primary" /> {property.parkingSpots}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex justify-between items-end mt-auto">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-accent">Valor Total</p>
                                            <p className="text-2xl font-black text-foreground tracking-tighter">
                                                R$ {Number(property.price).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="rounded-full border-border/50 text-[9px] font-bold px-3">
                                            {property.standard}
                                        </Badge>
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
        </div>
    );
}
