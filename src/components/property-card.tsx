"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, MapPin, Minimize2, Bed, Car, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteProperty } from "@/lib/actions/properties";

interface PropertyCardProps {
    property: {
        id: string;
        title: string;
        type: string;
        city: string;
        neighborhood: string | null;
        price: string | number;
        areaSqm: string | number | null;
        bedrooms: number | null;
        parkingSpots: number | null;
        status: string;
        photos: string[] | null;
    };
}

export function PropertyCard({ property }: PropertyCardProps) {
    const handleDelete = async () => {
        if (confirm("Tem certeza que deseja excluir este imóvel?")) {
            try {
                await deleteProperty(property.id);
            } catch (error) {
                alert("Erro ao excluir imóvel.");
            }
        }
    };

    return (
        <Card className="overflow-hidden bg-surface border-surface-2 group hover:border-primary/40 transition-all duration-300 shadow-sm">
            <div className="relative h-48 bg-bg flex items-center justify-center overflow-hidden">
                {property.photos && property.photos.length > 0 ? (
                    <img
                        src={property.photos[0]}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-text-muted">
                        <Home className="h-10 w-10 opacity-20" />
                        <span className="text-xs uppercase tracking-widest font-bold opacity-30">Sem Foto</span>
                    </div>
                )}
                <Badge
                    className={cn(
                        "absolute top-3 right-3 capitalize shadow-lg backdrop-blur-md",
                        property.status === "available" ? "bg-secondary text-white" : "bg-accent text-white"
                    )}
                >
                    {property.status === "available" ? "Disponível" : "Vendido"}
                </Badge>
            </div>

            <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-display font-medium text-text line-clamp-1">
                        {property.title}
                    </CardTitle>
                </div>
                <div className="flex items-center gap-1 text-text-muted text-sm mt-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{property.neighborhood}, {property.city}</span>
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
                <div className="text-xl font-bold text-primary">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(property.price))}
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-surface-2 text-text-muted text-xs">
                    <div className="flex flex-col items-center gap-1">
                        <Minimize2 className="h-4 w-4" />
                        <span>{property.areaSqm || "--"} m²</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 border-x border-surface-2 px-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms || "--"} Qtd.</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Car className="h-4 w-4" />
                        <span>{property.parkingSpots || "--"} Vagas</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                <Button variant="ghost" size="sm" className="flex-1 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-semibold uppercase tracking-wider">
                    <Edit className="h-3 w-3 mr-2" /> Editar
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="hover:bg-danger/10 hover:text-danger transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
