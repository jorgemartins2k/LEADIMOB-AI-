"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface Preferences {
  dailyReport: boolean;
  hotLeadAlert: boolean;
  browserPush: boolean;
  weeklyPerformance: boolean;
}

export default function PreferencesSection() {
  const [preferences, setPreferences] = useState<Preferences>({
    dailyReport: false,
    hotLeadAlert: false,
    browserPush: false,
    weeklyPerformance: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch current preferences from API
  useEffect(() => {
    async function fetchPrefs() {
      setLoading(true);
      try {
        const res = await fetch("/api/preferences");
        const data = await res.json();
        if (data.success && data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (e) {
        console.error("Error loading preferences", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPrefs();
  }, []);

  const handleToggle = (key: keyof Preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      const data = await res.json();
      if (data.success) {
        alert("Preferências salvas com sucesso!");
      } else {
        alert(data.error || "Erro ao salvar preferências.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar preferências.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Carregando preferências...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-3">
        <h3 className="font-display font-black text-3xl text-foreground uppercase tracking-tight">Preferências de Alerta</h3>
        <p className="text-body font-medium max-w-xl">Configure como a Raquel deve te notificar sobre novos leads e relatórios de performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex items-center justify-between p-8 rounded-[32px] bg-muted/20 border border-transparent hover:border-border/50 transition-all group">
          <div className="space-y-1">
            <span className="text-lg font-black uppercase tracking-tight text-foreground transition-all">Relatório Diário</span>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Resumo de atividades de ontem</p>
          </div>
          <Switch
            checked={preferences.dailyReport}
            onCheckedChange={() => handleToggle("dailyReport")}
            className="data-[state=checked]:bg-success"
          />
        </div>

        <div className="flex items-center justify-between p-8 rounded-[32px] bg-muted/20 border border-transparent hover:border-border/50 transition-all group">
          <div className="space-y-1">
            <span className="text-lg font-black uppercase tracking-tight text-foreground transition-all">Leads Quentes</span>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Alerta imediato de interesse forte</p>
          </div>
          <Switch
            checked={preferences.hotLeadAlert}
            onCheckedChange={() => handleToggle("hotLeadAlert")}
            className="data-[state=checked]:bg-hot"
          />
        </div>

        <div className="flex items-center justify-between p-8 rounded-[32px] bg-muted/20 border border-transparent hover:border-border/50 transition-all group">
          <div className="space-y-1">
            <span className="text-lg font-black uppercase tracking-tight text-foreground transition-all">Push no Navegador</span>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Notificações em tempo real</p>
          </div>
          <Switch
            checked={preferences.browserPush}
            onCheckedChange={() => handleToggle("browserPush")}
          />
        </div>

        <div className="flex items-center justify-between p-8 rounded-[32px] bg-muted/20 border border-transparent hover:border-border/50 transition-all group">
          <div className="space-y-1">
            <span className="text-lg font-black uppercase tracking-tight text-foreground transition-all">Performance Semanal</span>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estatísticas e insights da semana</p>
          </div>
          <Switch
            checked={preferences.weeklyPerformance}
            onCheckedChange={() => handleToggle("weeklyPerformance")}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary h-16 px-16 font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all bg-foreground text-background"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Salvar Preferências
        </Button>
      </div>
    </div>
  );
}

