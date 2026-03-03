"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, MapPin, Calendar, Trash2, Edit, UserPlus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteLaunch } from "@/lib/actions/launches";

interface LaunchCardProps {
    launch: {
        id: string;
        name: string;
        developer: string | null;
        city: string;
        neighborhood: string | null;
        priceFrom: string | number | null;
        deliveryDate: string | Date | null;
        status: string;
        photos: string[] | null;
    };
}

export function LaunchCard({ launch }: LaunchCardProps) {
    const handleDelete = async () => {
        if (confirm("Tem certeza que deseja excluir este lançamento?")) {
            try {
                await deleteLaunch(launch.id);
            } catch (error) {
                alert("Erro ao excluir lançamento.");
            }
        }
    };

    const statusMap: Record<string, { label: string; color: string }> = {
        pre_launch: { label: "Pré-lançamento", color: "bg-warning text-white" },
        launch: { label: "Lançamento", color: "bg-success text-white" },
        under_construction: { label: "Em obras", color: "bg-accent text-white" },
    };

    const status = statusMap[launch.status] || { label: launch.status, color: "bg-surface-2 text-text-muted" };

    return (
        <Card className="overflow-hidden bg-card border-border group card-hover shadow-sm flex flex-col">
            <div className="relative h-48 bg-muted overflow-hidden flex items-center justify-center">
                {launch.photos && launch.photos.length > 0 ? (
                    <img
                        src={launch.photos[0]}
                        alt={launch.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-30">
                        <Building2 className="h-12 w-12" />
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Sem Imagem</span>
                    </div>
                )}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge className={cn("px-2 py-0.5 text-[10px] uppercase font-bold border-none shadow-sm", status.color)}>
                        {status.label}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-5 pb-2">
                <CardTitle className="text-xl font-bold text-foreground line-clamp-1 pb-1 mb-2">
                    {launch.name}
                </CardTitle>
                <div className="flex flex-col gap-2 text-muted-foreground text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-accent" />
                        <span className="truncate">{launch.neighborhood}, {launch.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">Incorporadora: {launch.developer || "Não informada"}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-3 flex-1">
                <div className="bg-muted/30 rounded-2xl p-4 border border-border space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">A partir de</span>
                        <span className="text-xl font-extrabold text-success">
                            {launch.priceFrom
                                ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(launch.priceFrom))
                                : "Consulte"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground border-t border-border pt-3">
                        <Calendar className="h-3.5 w-3.5 text-purple" />
                        <span className="font-bold">Entrega: {launch.deliveryDate ? new Date(launch.deliveryDate).toLocaleDateString() : "--"}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-card border-border hover:bg-muted text-xs font-bold uppercase tracking-tight rounded-xl">
                    <Edit className="h-3.5 w-3.5 mr-2 opacity-60" /> Detalhes
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors rounded-full"
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
            </CardFooter>
        </Card>
    );
}
