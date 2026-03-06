import { MapPin } from "lucide-react";

interface PropertyMapProps {
    address?: string | null;
    neighborhood?: string | null;
    city?: string | null;
}

export function PropertyMap({ address, neighborhood, city }: PropertyMapProps) {
    // Construct search query
    const queryParts = [address, neighborhood, city].filter(Boolean);
    const searchQuery = encodeURIComponent(queryParts.join(", "));

    if (queryParts.length === 0) {
        return (
            <div className="aspect-video w-full rounded-2xl bg-muted/20 flex flex-col items-center justify-center gap-3 border border-dashed border-border/50">
                <MapPin className="h-8 w-8 text-muted-foreground/30" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground/40">Localização não informada</span>
            </div>
        );
    }

    // Using Google Maps Embed API (Standard mode which is usually free for iframe embeds)
    // We use the 'place' mode or just standard search search
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=REPLACE_WITH_API_KEY\u0026q=${searchQuery}`;

    // Alternative: Simple search URL if API key is not provided (more robust for quick demos)
    const fallbackMapUrl = `https://maps.google.com/maps?q=${searchQuery}\u0026t=\u0026z=15\u0026ie=UTF8\u0026iwloc=\u0026output=embed`;

    return (
        <div className="aspect-video w-full rounded-[32px] overflow-hidden border border-border/50 shadow-inner group">
            <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={fallbackMapUrl}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[20%] contrast-[1.1] brightness-[0.95] hover:grayscale-0 transition-all duration-700"
            />
        </div>
    );
}
