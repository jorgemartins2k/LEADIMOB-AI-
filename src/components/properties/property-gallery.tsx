"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PropertyGalleryProps {
    images: string[];
    title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="space-y-4">
            {/* Main Image Container */}
            <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl group bg-muted/20">
                <Image
                    src={images[currentIndex]}
                    alt={`${title} - Foto ${currentIndex + 1}`}
                    fill
                    className="object-cover transition-all duration-700"
                    priority
                />

                {/* Overlay with Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Navigation Buttons (Desktop Always, Mobile on Swipe/Touch) */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 z-10"
                            aria-label="Foto anterior"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 z-10"
                            aria-label="Próxima foto"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                )}

                {/* Counter Badge */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                    <Badge className="bg-black/40 backdrop-blur-md text-white border-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                        {currentIndex + 1} / {images.length}
                    </Badge>
                </div>

                {/* Full Screen Button */}
                <button
                    onClick={() => setIsFullScreen(true)}
                    className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/60 transition-all active:scale-95 z-10"
                    aria-label="Ver em tela cheia"
                >
                    <Maximize2 className="h-5 w-5" />
                </button>
            </div>

            {/* Thumbnails Container */}
            {images.length > 1 && (
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 no-scrollbar px-1">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={cn(
                                "relative w-20 h-14 sm:w-32 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-300 border-2",
                                currentIndex === idx
                                    ? "border-primary ring-2 ring-primary/20 scale-105 z-10"
                                    : "border-transparent opacity-50 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${title} mini - ${idx + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Full Screen Modal */}
            {isFullScreen && (
                <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col animate-in fade-in duration-300">
                    <div className="flex justify-between items-center p-6 bg-gradient-to-b from-black/50 to-transparent">
                        <h3 className="text-white font-black uppercase tracking-widest text-xs sm:text-sm">{title}</h3>
                        <button
                            onClick={() => setIsFullScreen(false)}
                            className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center p-4">
                        <div className="relative w-full h-full max-w-6xl max-h-[80vh]">
                            <Image
                                src={images[currentIndex]}
                                alt={title}
                                fill
                                className="object-contain"
                            />
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-6 w-14 h-14 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all"
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-6 w-14 h-14 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all"
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="p-8 flex justify-center gap-2 overflow-x-auto">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    currentIndex === idx ? "w-8 bg-primary" : "bg-white/20"
                                )}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
