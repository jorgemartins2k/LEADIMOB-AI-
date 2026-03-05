"use client";

import { useState, useRef, useEffect } from "react";
import { User, Bell, Clock, Save, Camera, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PreferencesSection from "@/components/notification/PreferencesSection";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { updateProfile, getProfile, saveAvatarUrl } from "@/lib/actions/profile";
import { getWorkSchedules, saveWorkSchedules } from "@/lib/actions/schedule";
import { uploadImage } from "@/lib/supabase/storage";
import { useAuth } from "@clerk/nextjs";

// ─── Types ───────────────────────────────────────────────────────────────────

type DaySchedule = {
    name: string;
    dayOfWeek: number;
    active: boolean;
    startTime: string;
    endTime: string;
};

const profileSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    whatsapp: z.string().optional(),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    creci: z.string().optional(),
    presentation: z.string().optional(),
    realEstateAgency: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConfiguraçõesPage() {
    const [activeTab, setActiveTab] = useState("horarios");
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingSchedule, setIsSavingSchedule] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [workDays, setWorkDays] = useState<DaySchedule[]>([
        { name: "Segunda-feira", dayOfWeek: 1, active: true, startTime: "09:00", endTime: "18:00" },
        { name: "Terça-feira", dayOfWeek: 2, active: true, startTime: "09:00", endTime: "18:00" },
        { name: "Quarta-feira", dayOfWeek: 3, active: true, startTime: "09:00", endTime: "18:00" },
        { name: "Quinta-feira", dayOfWeek: 4, active: true, startTime: "09:00", endTime: "18:00" },
        { name: "Sexta-feira", dayOfWeek: 5, active: true, startTime: "09:00", endTime: "18:00" },
        { name: "Sábado", dayOfWeek: 6, active: false, startTime: "09:00", endTime: "13:00" },
        { name: "Domingo", dayOfWeek: 0, active: false, startTime: "09:00", endTime: "13:00" },
    ]);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            whatsapp: "",
            email: "",
            creci: "",
            presentation: "",
            realEstateAgency: "",
        },
    });

    // ── Load data on mount ──
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab) setActiveTab(tab);

        async function loadData() {
            const [profile, schedules] = await Promise.all([
                getProfile(),
                getWorkSchedules(),
            ]);

            if (profile) {
                form.reset({
                    name: profile.name,
                    whatsapp: profile.whatsapp || "",
                    email: profile.email || "",
                    creci: profile.creci || "",
                    presentation: profile.presentation || "",
                    realEstateAgency: profile.realEstateAgency || "",
                });
                if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);
            }

            if (schedules && schedules.length > 0) {
                setWorkDays((prev) =>
                    prev.map((day) => {
                        const match = schedules.find((s) => s.dayOfWeek === day.dayOfWeek);
                        if (match) {
                            return {
                                ...day,
                                active: match.isActive,
                                startTime: match.startTime.substring(0, 5),
                                endTime: match.endTime.substring(0, 5),
                            };
                        }
                        return day;
                    })
                );
            }
        }
        loadData();
    }, [form]);

    // ── Tabs ──
    const tabs = [
        { id: "horarios", label: "Horários de Atendimento", icon: Clock },
        { id: "notificacoes", label: "Notificações", icon: Bell },
        { id: "dados", label: "Dados Pessoais", icon: User },
    ];

    // ── Handlers ──

    const toggleDay = (dayIndex: number) => {
        const newDays = [...workDays];
        newDays[dayIndex].active = !newDays[dayIndex].active;
        setWorkDays(newDays);
    };

    const onSaveSchedule = async () => {
        setIsSavingSchedule(true);
        try {
            const result = await saveWorkSchedules(
                workDays.map((day) => ({
                    dayOfWeek: day.dayOfWeek,
                    isActive: day.active,
                    startTime: day.startTime,
                    endTime: day.endTime,
                }))
            );

            if (result.error) {
                alert(result.error);
                return;
            }
            alert("Expediente da IA atualizado com sucesso! 🕒");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar horários.");
        } finally {
            setIsSavingSchedule(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Por favor, selecione um arquivo de imagem.");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("A imagem deve ter no máximo 5MB.");
            return;
        }

        setIsUploading(true);
        try {
            // Upload to Supabase storage bucket "profile-photos"
            const url = await uploadImage(file, "profile-photos");
            // Save URL to DB
            const result = await saveAvatarUrl(url);
            if (result.error) {
                alert("Erro ao salvar foto: " + result.error);
                return;
            }
            setAvatarUrl(url);
            alert("Foto de perfil atualizada com sucesso! 📸");
        } catch (error: any) {
            console.error(error);
            alert("Erro ao fazer upload da foto: " + (error.message || "Tente novamente."));
        } finally {
            setIsUploading(false);
            // Reset input so same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handlePasswordReset = async () => {
        const email = form.getValues("email");
        if (!email) {
            alert("Por favor, preencha o campo de e-mail antes de redefinir a senha.");
            return;
        }

        try {
            const response = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (data.error) {
                alert("Erro ao enviar e-mail: " + data.error);
            } else {
                alert("Um link de redefinição de senha foi enviado para o seu e-mail! Verifique sua caixa de entrada.");
            }
        } catch (e) {
            alert("Erro ao solicitar redefinição de senha. Tente novamente.");
        }
    };

    async function onProfileSubmit(values: ProfileFormValues) {
        setIsSaving(true);
        try {
            const result = await updateProfile(values);
            if (result.error) {
                alert("Erro ao atualizar perfil: " + result.error);
            } else {
                alert("Perfil profissional atualizado com sucesso! ✅");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar perfil.");
        } finally {
            setIsSaving(false);
        }
    }

    // ── Render ──
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000 pb-20">
            {/* Hidden file input for avatar upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <h1 className="heading-xl text-foreground">Configurações do <span className="text-gradient-accent">Sistema</span></h1>
                    <p className="text-body font-medium leading-relaxed">Personalize sua experiência e os parâmetros de atuação da <span className="text-foreground font-black">Raquel</span>.</p>
                </div>
                <div className="px-5 py-2 bg-success/10 text-success rounded-full text-[10px] font-black uppercase tracking-widest border border-success/20 flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    Notificações Ativas
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 bg-muted/20 p-2.5 rounded-[32px] w-fit overflow-x-auto no-scrollbar border border-border/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-3 px-10 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap btn-interactive",
                            activeTab === tab.id
                                ? "bg-foreground text-background shadow-2xl shadow-black/20"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="card-premium p-10 md:p-14">

                {/* Tab: Horários de Atendimento */}
                {activeTab === "horarios" && (
                    <div className="space-y-12">
                        <div className="flex flex-col gap-3">
                            <h3 className="font-display font-black text-3xl text-foreground uppercase tracking-tight">Expediente da IA</h3>
                            <p className="text-body font-medium max-w-xl">Defina em quais janelas a Raquel iniciará novas conversas para garantir que você esteja disponível para assumir.</p>
                        </div>

                        <div className="grid gap-6">
                            {workDays.map((day, index) => (
                                <div key={day.name} className="flex flex-wrap items-center justify-between gap-8 p-8 rounded-[32px] bg-muted/20 border border-transparent hover:border-border/50 transition-all group">
                                    <div className="flex items-center gap-8 min-w-[240px]">
                                        <Switch
                                            checked={day.active}
                                            onCheckedChange={() => toggleDay(index)}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                        <span className={cn("text-lg font-black uppercase tracking-tight transition-all", day.active ? "text-foreground" : "text-muted-foreground opacity-30")}>
                                            {day.name}
                                        </span>
                                    </div>

                                    {day.active ? (
                                        <div className="flex items-center gap-4 bg-card border border-border/50 p-2.5 rounded-2xl shadow-sm group-hover:shadow-md transition-all">
                                            <input
                                                type="text"
                                                value={day.startTime}
                                                onChange={(e) => {
                                                    const newDays = [...workDays];
                                                    newDays[index].startTime = e.target.value;
                                                    setWorkDays(newDays);
                                                }}
                                                className="w-20 bg-transparent text-center font-black text-base text-foreground tracking-tighter focus:outline-none"
                                            />
                                            <span className="text-muted-foreground font-black opacity-10 text-xl">—</span>
                                            <input
                                                type="text"
                                                value={day.endTime}
                                                onChange={(e) => {
                                                    const newDays = [...workDays];
                                                    newDays[index].endTime = e.target.value;
                                                    setWorkDays(newDays);
                                                }}
                                                className="w-20 bg-transparent text-center font-black text-base text-foreground tracking-tighter focus:outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <div className="px-8 py-3 rounded-full bg-muted/10 border border-border/20 text-[10px] font-black uppercase tracking-widest opacity-40">Folga da IA</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-8 gap-4">
                            <Button
                                onClick={onSaveSchedule}
                                disabled={isSavingSchedule}
                                className="btn-primary h-16 px-16 font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all bg-foreground text-background"
                            >
                                {isSavingSchedule ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Atualizar Expediente
                            </Button>
                            <Button className="btn-primary h-16 px-10 font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all" asChild variant="outline">
                                <Link href="/agenda/novo">
                                    <Plus className="h-5 w-5" /> Agendar Compromisso
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Tab: Notificações */}
                {activeTab === "notificacoes" && <PreferencesSection />}

                {/* Tab: Dados Pessoais */}
                {activeTab === "dados" && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-16">
                            {/* Profile Header */}
                            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                                <div className="relative group">
                                    <div className="w-48 h-48 rounded-[64px] bg-gradient-to-br from-primary via-accent to-purple p-1.5 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                        <div className="w-full h-full rounded-[60px] bg-card flex items-center justify-center overflow-hidden border-8 border-card">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt="Foto de perfil"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-24 h-24 text-muted-foreground opacity-10" />
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        type="button"
                                        onClick={handleAvatarClick}
                                        disabled={isUploading}
                                        className="absolute -bottom-4 -right-4 w-16 h-16 rounded-[24px] bg-foreground text-background shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-card"
                                    >
                                        {isUploading ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <Camera className="w-6 h-6" />
                                        )}
                                    </Button>
                                </div>
                                <div className="flex-1 space-y-6 text-center lg:text-left">
                                    <div className="space-y-2">
                                        <h3 className="font-display font-black text-5xl text-foreground uppercase tracking-tight leading-none">{form.watch("name") || "Seu Nome"}</h3>
                                        <p className="text-body font-medium opacity-60">Consultor Imobiliário</p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Membro PRO</Badge>
                                        <Badge variant="outline" className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-border text-muted-foreground">ID: #45920-A</Badge>
                                    </div>
                                </div>
                                <Button type="button" variant="ghost" className="rounded-2xl text-hot font-black uppercase tracking-widest text-[10px] h-14 px-10 border border-hot/10 hover:bg-hot/5 transition-all hover:scale-105 btn-interactive">
                                    Sair da Conta
                                </Button>
                            </div>

                            <Separator className="bg-border opacity-30" />

                            {/* Form Fields */}
                            <div className="grid gap-12 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">Nome Profissional</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-18 bg-muted/20 border-border/50 rounded-3xl font-black text-lg p-8 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="whatsapp"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">WhatsApp para Notificações</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="(00) 00000-0000" className="h-18 bg-muted/20 border-border/50 rounded-3xl font-black text-lg p-8 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                                            </FormControl>
                                            <p className="text-[9px] font-bold text-muted-foreground opacity-40 ml-4">*Onde você receberá os alertas de leads aquecidos.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">E-mail Corporativo</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-18 bg-muted/20 border-border/50 rounded-3xl font-black text-lg p-8 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="creci"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">CRECI Ativo</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-18 bg-muted/20 border-border/50 rounded-3xl font-black text-lg p-8 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="realEstateAgency"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                            <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">Imobiliária / Agência</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-18 bg-muted/20 border-border/50 rounded-3xl font-black text-lg p-8 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="presentation"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4 md:col-span-2">
                                            <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-4">Texto de Apresentação (IA)</FormLabel>
                                            <FormControl>
                                                <textarea
                                                    {...field}
                                                    className="w-full min-h-[180px] bg-muted/20 border border-border/50 rounded-[40px] p-8 font-bold text-base focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all leading-relaxed"
                                                    placeholder="Corretor especializado em imóveis de luxo..."
                                                />
                                            </FormControl>
                                            <p className="text-[10px] font-bold text-muted-foreground opacity-40 ml-4 italic">*Este texto auxilia a Raquel a entender seu perfil profissional ao falar com os leads.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex flex-col md:flex-row justify-end pt-12 gap-6">
                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={handlePasswordReset}
                                    className="font-black uppercase tracking-widest text-[10px] h-18 px-12 rounded-3xl hover:bg-muted btn-interactive"
                                >
                                    Redefinir Senha de Acesso
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn-primary px-20 h-18 text-xs font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5 mr-3" />
                                    )}
                                    Salvar Perfil Profissional
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </div>
        </div>
    );
}
