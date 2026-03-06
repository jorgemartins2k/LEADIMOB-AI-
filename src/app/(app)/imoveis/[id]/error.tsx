"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 card-premium bg-destructive/5 border-destructive/20 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <span className="text-4xl text-destructive font-black">!</span>
            </div>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Ops! Algo deu errado.</h2>
            <p className="text-muted-foreground max-w-md mx-auto line-clamp-3">
                {error.message || "Ocorreu um erro inesperado ao carregar os detalhes do imóvel."}
            </p>
            {error.digest && (
                <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-50">
                    Digest: {error.digest}
                </p>
            )}
            <div className="flex gap-4">
                <Button
                    onClick={() => (window.location.href = "/imoveis")}
                    variant="outline"
                    className="rounded-2xl h-14 px-8"
                >
                    Voltar ao Portfólio
                </Button>
                <Button
                    onClick={() => reset()}
                    className="rounded-2xl h-14 px-8 bg-foreground text-background"
                >
                    Tentar Novamente
                </Button>
            </div>
        </div>
    );
}
