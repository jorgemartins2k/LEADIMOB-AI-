"use client";

import { Plus, Search, Filter, Home, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function PropertiesPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="heading-hero text-foreground">Imóveis</h1>
                    <p className="text-body text-lg">Gerencie seu portfólio para a Raquel oferecer aos leads.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-8 h-16 rounded-[24px] shadow-primary/20 shadow-xl transition-all hover:scale-105 active:scale-95 text-xs">
                    <Plus className="h-5 w-5 mr-3" /> Adicionar Imóvel
                </Button>
            </div>

            {/* Search Section */}
            <div className="bg-card border border-border p-4 rounded-[32px] shadow-soft">
                <div className="relative max-w-xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
                    <Input
                        placeholder="Buscar leads, imóveis..."
                        className="pl-14 h-16 bg-muted/30 border-none rounded-2xl font-bold text-sm tracking-tight placeholder:text-muted-foreground/40 focus-visible:ring-primary/20"
                    />
                </div>
            </div>

            {/* Empty State Area */}
            <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-muted/50 rounded-[48px] bg-muted/5 group hover:border-primary/20 transition-all duration-500">
                <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                    <Home className="h-12 w-12 text-success opacity-80" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4 text-center">Nenhum imóvel cadastrado</h3>
                <p className="text-muted-foreground font-bold max-w-sm text-center text-sm mb-12 opacity-60">
                    Adicione suas primeiras propriedades para que a IA tenha o que oferecer aos seus leads.
                </p>
                <Button className="bg-foreground text-background font-black uppercase tracking-widest px-10 h-16 rounded-[24px] shadow-soft transition-all hover:scale-105 active:scale-95 text-xs">
                    <Plus className="h-5 w-5 mr-3" /> Adicionar Primeiro Imóvel
                </Button>
            </div>
        </div>
    );
}
