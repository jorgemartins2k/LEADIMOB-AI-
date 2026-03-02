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
            const uploadPromises = acceptedFiles.map(file => uploadImage(file));
            const urls = await Promise.all(uploadPromises);
            onChange([...value, ...urls]);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Erro ao fazer upload da imagem.");
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
                    <div key={url} className="relative aspect-square rounded-2xl overflow-hidden bg-surface-2 border border-surface-2 group">
                        <div className="absolute top-2 right-2 z-10">
                            <Button
                                type="button"
                                onClick={() => onRemove(url)}
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-full shadow-lg shadow-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <img src={url} alt="Imóvel" className="object-cover h-full w-full" />
                    </div>
                ))}
                <div
                    {...getRootProps()}
                    className={cn(
                        "aspect-square rounded-2xl border-2 border-dashed border-surface-2 bg-surface/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-surface/50 transition-all",
                        isDragActive && "border-primary bg-primary/5",
                        (disabled || isUploading) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    ) : (
                        <>
                            <div className="h-10 w-10 bg-surface-2 rounded-xl flex items-center justify-center mb-3">
                                <Upload className="h-5 w-5 text-text-muted" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted text-center px-4">
                                Arraste fotos ou clique aqui
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
