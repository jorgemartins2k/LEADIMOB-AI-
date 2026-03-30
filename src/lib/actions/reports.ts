"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { getOrCreateInternalUser } from "@/lib/auth-utils";

export type DateRange = {
    from: Date;
    to: Date;
};

export async function getReportMetrics(range: DateRange) {
    const user = await getOrCreateInternalUser();

    // Convert to ISO string for DB comparison if needed, or Drizzle handles Date objects.
    // Drizzle with pg handles Date objects.
    const startOfDay = new Date(range.from);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(range.to);
    endOfDay.setHours(23, 59, 59, 999);

    const periodLeads = await db.query.leads.findMany({
        where: and(
            eq(leads.userId, user.id),
            // Filtro por createdAt dentro do período selecionado
            gte(leads.createdAt, startOfDay),
            lte(leads.createdAt, endOfDay)
        ),
        orderBy: [asc(leads.createdAt)]
    });

    // 1. Tendência de Volume (agrupado por data para o gráfico de linhas)
    const volumeByDate: Record<string, number> = {};
    const followUpsByDate: Record<string, number> = {};

    // 2. Funil de Vendas
    let filaCount = 0;
    let atendimentoCount = 0; // Ativos com 0 fup
    let followupCount = 0; // Agendados ou com fup > 0
    let convertidosCount = 0; // Won / completed
    let perdidosCount = 0; // Abandoned
    let quentesCount = 0;

    // 3. Extração de Insights (Keywords simples de Bairros/Regiões)
    const bairrosMap: Record<string, number> = {};
    const perfisFechadosMap: Record<string, number> = {};
    const imoveisMap: Record<string, number> = {};
    const familiasMap: Record<string, number> = {};

    const keywordImoveis = ['lançamento', 'casa', 'condomínio', 'apartamento', 'cobertura', 'terreno', 'sobrado', 'studio', 'duplex', 'lote', 'comercial', 'galpão'];
    const keywordFamilias = ['casal', 'solteiro', 'solteira', 'família', 'filho', 'filhos', 'pet', 'cachorro', 'noivos', 'aposentado', 'divorciado', 'investidor'];

    periodLeads.forEach(lead => {
        // Formatar data local "YYYY-MM-DD"
        const dateStr = lead.createdAt?.toISOString().split('T')[0] || 'Unknown';

        // --- Tendência ---
        volumeByDate[dateStr] = (volumeByDate[dateStr] || 0) + 1;
        if ((lead.followUpCount || 0) > 0) {
            followUpsByDate[dateStr] = (followUpsByDate[dateStr] || 0) + 1;
        }

        // --- Funil ---
        const status = lead.status || '';
        if (status === 'waiting' || status === 'ooh_rescheduled') filaCount++;
        else if (status === 'won' || status === 'completed') convertidosCount++;
        else if (status.startsWith('abandoned')) perdidosCount++;
        else if (status === 'scheduled' || (lead.followUpCount || 0) > 0) followupCount++;
        else atendimentoCount++;

        // --- Aquecimento ---
        if (lead.temperature === 'quente' || lead.temperature === 'very_hot') quentesCount++;

        // --- Extratores de Texto ---
        const textoCompleto = ((lead.notes || '') + ' ' + (lead.profile || '')).toLowerCase();

        // 1. Extração de Bairros
        if (lead.notes) {
            const matches = lead.notes.match(/bairro\s+([A-ZÀ-Ÿa-zà-ÿ0-9\s]+)/i);
            if (matches && matches[1]) {
                const b = matches[1].split(/[.,\n\-]/)[0].trim().substring(0, 20); // Pega a primeira palavra/termo
                if (b.length > 3) bairrosMap[b] = (bairrosMap[b] || 0) + 1;
            }
        }

        // 2. Perfis que mais fecham
        if ((status === 'won' || status === 'completed') && lead.profile) {
            const p = lead.profile.trim();
            if (p) perfisFechadosMap[p] = (perfisFechadosMap[p] || 0) + 1;
        }

        // 3. Tipos de Imóveis Mais Procurados
        keywordImoveis.forEach(kw => {
            if (textoCompleto.includes(kw)) {
                imoveisMap[kw] = (imoveisMap[kw] || 0) + 1;
            }
        });

        // 4. Composição Familiar / Estilo de Cliente
        keywordFamilias.forEach(kw => {
            if (textoCompleto.includes(kw)) {
                // Unifica palavras similares
                let chave = kw;
                if (kw === 'filho' || kw === 'filha' || kw === 'filhos') chave = 'com filhos';
                if (kw === 'solteira') chave = 'solteiro';
                if (kw === 'cachorro') chave = 'pet';

                familiasMap[chave] = (familiasMap[chave] || 0) + 1;
            }
        });
    });

    // Converter Maps para Arrays Ordenados para o Gráfico
    const trendData = Object.keys(volumeByDate).sort().map(date => ({
        date,
        total: volumeByDate[date],
        followups: followUpsByDate[date] || 0
    }));

    const topBairros = Object.entries(bairrosMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    const topPerfis = Object.entries(perfisFechadosMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    const topImoveis = Object.entries(imoveisMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    const topFamilias = Object.entries(familiasMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    return {
        success: true,
        summary: {
            total: periodLeads.length,
            hotSent: quentesCount,
            followupsSuccess: followupCount, // Leads resgatados ou em negociação longa
        },
        funnel: [
            { stage: 'Entrada (Fila)', value: filaCount, fill: '#64748b' },
            { stage: 'Em Atendimento', value: atendimentoCount, fill: '#3b82f6' },
            { stage: 'Nutrição (Follow-up)', value: followupCount, fill: '#a855f7' },
            { stage: 'Convertidos (Ganhos)', value: convertidosCount, fill: '#22c55e' }
        ],
        trend: trendData,
        insights: {
            topBairros: topBairros.length > 0 ? topBairros : [{ name: 'Dados Insuficientes', count: 0 }],
            topPerfis: topPerfis.length > 0 ? topPerfis : [{ name: 'Ainda sem conversões com perfil mapeado', count: 0 }],
            topImoveis: topImoveis.length > 0 ? topImoveis : [{ name: 'Dados Insuficientes', count: 0 }],
            topFamilias: topFamilias.length > 0 ? topFamilias : [{ name: 'Dados Insuficientes', count: 0 }]
        }
    };
}
