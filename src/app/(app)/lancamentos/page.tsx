import { Plus, Search, Filter, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLaunches } from "@/lib/actions/launches";
import { LaunchCard } from "@/components/launch-card";

export default async function LaunchesPage() {
    const launches = await getLaunches().catch(() => []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-2 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-text">Lançamentos</h1>
                    <p className="text-text-muted text-sm">Próximas novidades e empreendimentos em destaque.</p>
                </div>
                <Link href="/lancamentos/novo">
                    <Button className="bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 px-6 h-11">
                        <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
                    </Button>
                </Link>
            </div>

            {/* Grid section */}
            {launches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-surface-2 rounded-3xl bg-surface/30">
                    <div className="h-16 w-16 bg-surface-2 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="h-8 w-8 text-text-muted opacity-30" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-text">Nenhum lançamento cadastrado</h3>
                    <p className="text-text-muted mt-2 max-w-sm text-center">
                        Adicione lançamentos imobiliários para que a Raquel possa apresentar as melhores oportunidades aos seus clientes.
                    </p>
                    <Link href="/lancamentos/novo" className="mt-6">
                        <Button variant="link" className="text-primary font-bold">
                            Cadastrar lançamento agora
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {launches.map((launch) => (
                        <LaunchCard key={launch.id} launch={launch as any} />
                    ))}
                </div>
            )}
        </div>
    );
}
