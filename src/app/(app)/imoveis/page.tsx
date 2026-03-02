import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProperties } from "@/lib/actions/properties";
import { PropertyCard } from "@/components/property-card";

export default async function PropertiesPage() {
    const properties = await getProperties().catch(() => []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-text">Meus Imóveis</h1>
                    <p className="text-text-muted">Gerencie seu portfólio para a Raquel oferecer aos leads.</p>
                </div>
                <Link href="/imoveis/novo">
                    <Button className="bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Imóvel
                    </Button>
                </Link>
            </div>

            {/* Filters section */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Buscar por título, bairro ou cidade..."
                        className="pl-10 bg-surface border-surface-2 focus:border-primary/50 transition-all rounded-xl"
                    />
                </div>
                <Button variant="outline" className="border-surface-2 hover:bg-surface-2 transition-colors rounded-xl">
                    <Filter className="h-4 w-4 mr-2" /> Filtros
                </Button>
            </div>

            {/* Grid section */}
            {properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-surface-2 rounded-3xl bg-surface/30">
                    <div className="h-16 w-16 bg-surface-2 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-text-muted opacity-30" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-text">Nenhum imóvel encontrado</h3>
                    <p className="text-text-muted mt-2 max-w-sm text-center">
                        Comece adicionando seu primeiro imóvel para que a IA possa começar a trabalhar.
                    </p>
                    <Link href="/imoveis/novo" className="mt-6">
                        <Button variant="link" className="text-primary font-bold">
                            Cadastrar imóvel agora
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <PropertyCard key={property.id} property={property as any} />
                    ))}
                </div>
            )}
        </div>
    );
}
