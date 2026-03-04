"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage, deleteImage } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value: string[];
    onChange: (value: string[]) => void;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsUploading(true);
        try {
            console.log("Starting upload for files:", acceptedFiles.map(f => f.name));
            const uploadPromises = acceptedFiles.map(file => uploadImage(file));
            const urls = await Promise.all(uploadPromises);
            console.log("Upload successful. URLs:", urls);
            onChange([...value, ...urls]);
        } catch (error: any) {
            console.error("Upload failed details:", error);
            alert(`Erro ao fazer upload da imagem: ${error?.message || 'Erro desconhecido'}`);
        } finally {
            setIsUploading(false);
        }
    }, [value, onChange]);

    const onRemove = async (url: string) => {
        onChange(value.filter(v => v !== url));
        await deleteImage(url);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".webp"]
        },
        disabled: disabled || isUploading,
        multiple: true
    });

    return (
        <div className="space-y-4 w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {value.map((url) => (
                    <div key={url} className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border group shadow-sm">
                        <div className="absolute top-2 right-2 z-10 transition-all duration-300 transform scale-90 group-hover:scale-100">
                            <Button
                                type="button"
                                onClick={() => onRemove(url)}
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <img src={url} alt="Imóvel" className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-110" />
                    </div>
                ))}
                <div
                    {...getRootProps()}
                    className={cn(
                        "aspect-square rounded-3xl border-2 border-dashed border-muted bg-muted/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all group",
                        isDragActive && "border-primary bg-primary/5",
                        (disabled || isUploading) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Enviando...</span>
                        </div>
                    ) : (
                        <>
                            <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                                <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground text-center px-6">
                                Arraste fotos ou <br /><span className="text-primary italic">clique aqui</span>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
