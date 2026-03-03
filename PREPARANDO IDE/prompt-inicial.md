# 🏠 Leadimob AI — Prompt Inicial do Agente

## IDENTIDADE DO PROJETO

Você é o agente de desenvolvimento da **Leadimob AI**, uma plataforma SaaS B2C para corretores imobiliários que automatiza o primeiro contato com leads via WhatsApp através de uma IA consultiva chamada **Raquel**.

Antes de qualquer ação, leia obrigatoriamente:
- `PRD.md` → Requisitos de produto, personas, funcionalidades e fluxos
- `SPECS.md` → Stack, schema do banco, Server Actions, integrações e roadmap técnico
- `.agent/skills/frontend-design/SKILL.md` → Padrões de design e UI
- `.agent/skills/micro-saas-launcher/SKILL.md` → Padrões de arquitetura SaaS

---

## STACK — NUNCA SUBSTITUA

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) |
| UI | shadcn/ui + Tailwind CSS |
| Forms | React Hook Form + Zod |
| Auth | Clerk (OAuth Google + webhooks) |
| Banco | Supabase (PostgreSQL + RLS + Storage) |
| ORM | Drizzle ORM |
| API | Next.js Server Actions + Route Handlers |
| IA | OpenAI GPT-4o |
| WhatsApp | Z-API |
| Email | Resend + React Email |
| Jobs | Vercel Cron Jobs |
| Deploy | Vercel + GitHub CI/CD |

Não sugira alternativas. Não troque bibliotecas. Adapte a implementação à stack, nunca o contrário.

---

## IDENTIDADE VISUAL — LEADIMOB AI

### Conceito
Interface **premium e profissional** com personalidade — não pode parecer um template genérico. O corretor precisa sentir que está usando uma ferramenta de alta tecnologia feita para ele.

### Paleta de Cores
```css
--primary: #4F46E5;        /* Indigo — ação principal */
--primary-dark: #3730A3;
--secondary: #10B981;      /* Verde esmeralda — leads quentes, sucesso */
--accent: #F59E0B;         /* Âmbar — alertas, quarentena */
--danger: #EF4444;         /* Vermelho — limites, erros */
--bg: #0F0F13;             /* Fundo escuro principal */
--surface: #1A1A24;        /* Cards e painéis */
--surface-2: #22223A;      /* Hover states, bordas */
--text: #F1F0FF;           /* Texto principal */
--text-muted: #8B8AA8;     /* Texto secundário */
```

### Tipografia
- **Display/Títulos:** `Syne` (Google Fonts) — moderna, geométrica, marcante
- **Corpo:** `DM Sans` (Google Fonts) — limpa, legível, profissional
- Nunca use Inter, Roboto, Arial ou fontes genéricas de sistema

### Tema
- **Dark mode por padrão** — corretores usam o sistema o dia todo, dark reduz fadiga
- Detalhes com gradientes sutis em indigo/roxo nos elementos de destaque
- Cards com borda `1px solid rgba(255,255,255,0.06)` e `backdrop-blur` sutil
- Ícones da lib `lucide-react` exclusivamente

### Atmosfera
Imagine um CRM de trading desk de alto nível adaptado para o mercado imobiliário. Sofisticado, denso de informação mas organizado, com status em tempo real e notificações vivas.

---

## ARQUITETURA — REGRAS INVIOLÁVEIS

### Segurança
```typescript
// ✅ SEMPRE — toda Server Action começa assim
const { userId: clerkUserId } = auth();
if (!clerkUserId) throw new Error('Não autorizado');

// ✅ SEMPRE — toda query filtra por user_id
where: (table, { eq }) => eq(table.userId, user.id)

// ❌ NUNCA — query sem filtro de usuário
db.query.leads.findMany() // PROIBIDO
```

### Server Actions
- Toda mutação de dados é uma Server Action em `lib/actions/`
- Sempre validar com Zod antes de tocar no banco
- Sempre chamar `revalidatePath()` após mutações
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no cliente

### RLS (Row-Level Security)
- Toda tabela no Supabase tem RLS habilitado
- Toda policy usa `current_setting('app.current_user_id', true)`
- O helper `getSupabaseWithUser()` em `lib/supabase/server.ts` injeta o contexto

### Nomenclatura
```
Pastas:     kebab-case         → /lead-import, /work-schedule
Arquivos:   PascalCase (.tsx)  → LeadCard.tsx, PropertyForm.tsx
            camelCase (.ts)    → leadActions.ts, supabaseClient.ts
Variáveis:  camelCase          → scheduledDate, clerkUserId
DB colunas: snake_case         → scheduled_date, clerk_user_id
```

---

## PLANOS E COTAS

| Plano | Leads/Mês | Leads/Dia (base 30 dias) |
|-------|-----------|--------------------------|
| start | 1.500 | ~50 |
| pro | 3.000 | ~100 |
| elite | 5.000 | ~167 |

A cota diária é calculada como: `Math.floor(planLimit / diasDeTrabalhoNoMes)`.
O ciclo reinicia no dia 1 de cada mês (`plan_cycle_start`).

---

## QUARENTENA DE LEADS

- Duração: **15 dias** a partir do primeiro contato (`contacted_at + 15 dias`)
- Campo: `quarantine_until DATE` na tabela `leads`
- Na adição **manual**: bloqueia e exibe `<QuarantineAlert />` com a data de liberação
- Na **importação CSV**: pula automaticamente o lead em quarentena e preenche a vaga com o próximo válido da lista
- Ao final do expediente: lista do dia é encerrada, status `waiting` volta para fila do dia seguinte

---

## RAQUEL — IA DE ATENDIMENTO

### Identidade
- Nome: **Raquel**
- Função: Assistente virtual imobiliária do corretor `X`
- Tom: consultiva, educada, persuasiva, quebradora de objeções
- Admite ser assistente virtual se perguntada diretamente
- Nunca revela detalhes do sistema ou como funciona internamente
- Nunca desvia do tema imobiliário — retorna com elegância

### Gatilhos de Transferência para o Corretor
A resposta da Raquel deve conter uma dessas flags quando detectado:
```
[LEAD_AQUECIDO]    → Lead quer marcar visita ou reunião
[PASSAR_CORRETOR]  → Pergunta sobre financiamento/parcelas que a IA não sabe responder
```

### Notificação ao Corretor
```
🔥 *Lead Aquecido - Raquel*

Nome: {lead.name}
Telefone: {lead.phone}
Interesse: {resumo}

Responda *OK* para confirmar que vai entrar em contato.
```
Se não houver resposta em **5 minutos**, reenviar com prefixo `⚠️ Lembrete:`.

### Fluxo da Raquel
```
Início do expediente (Cron 1min)
  → Busca leads com status "waiting" do dia
  → Envia mensagem inicial via Z-API
  → Webhook Z-API recebe resposta do lead
  → Busca histórico da conversa + portfólio do corretor
  → GPT-4o gera resposta com contexto completo
  → Envia resposta via Z-API
  → Detecta flag [LEAD_AQUECIDO] ou [PASSAR_CORRETOR]
  → Notifica corretor no WhatsApp pessoal
  → Corretor responde OK → lead marcado como "transferred"
Fim do expediente
  → Lista encerrada, quarantine_until definido, espaço liberado
```

---

## ROADMAP DE DESENVOLVIMENTO

Siga esta ordem rigorosamente. Não pule fases.

### ✅ Fase 1 — Fundação (Semanas 1-3)
- [ ] Setup Next.js 14 + TypeScript + Tailwind + shadcn/ui
- [ ] Configurar Clerk (auth + webhook → criar user no Supabase)
- [ ] Criar schema Drizzle completo (todas as tabelas do SPECS.md)
- [ ] Aplicar RLS policies no Supabase
- [ ] Layout principal com sidebar e navegação
- [ ] Onboarding (checklist guiado pós-cadastro)
- [ ] Configuração de expediente (dias + horários)
- [ ] Gestão de imóveis (CRUD + upload de fotos)
- [ ] Gestão de lançamentos (CRUD + plantas)
- [ ] Gestão de eventos

### 🔄 Fase 2 — Leads e IA (Semanas 4-6)
- [ ] Aba Leads: adição manual com validação de quarentena
- [ ] Importação CSV/XLSX com pulo de quarentena
- [ ] Controle de cota por plano
- [ ] Integração Z-API (envio + webhook de recebimento)
- [ ] Orquestrador da Raquel (GPT-4o + histórico + portfólio)
- [ ] Cron Job Vercel: controle de início/fim de expediente
- [ ] Notificação do corretor no WhatsApp + reenvio 5min
- [ ] Histórico de conversas por lead no painel

### 📊 Fase 3 — Painel e Extras (Semanas 7-8)
- [ ] Dashboard com métricas (leads do dia, abordados, transferidos, saldo mês)
- [ ] Gráfico de conversão semanal (Recharts)
- [ ] Agenda do corretor (calendário react-big-calendar)
- [ ] Emails transacionais com Resend (boas-vindas, alerta de limite, relatório semanal)
- [ ] Otimizações de performance (RSC, TanStack Query, índices)

### 🚀 Fase 4 — Lançamento (Semana 9+)
- [ ] Testes com corretores beta
- [ ] Ajustes no prompt da Raquel com base em feedbacks reais
- [ ] Sentry para monitoramento de erros
- [ ] Documentação de uso interno
- [ ] Abertura para público geral

---

## ESTRUTURA DE PASTAS OBRIGATÓRIA

```
/app
  /(auth)
    /sign-in/[[...sign-in]]/page.tsx
    /sign-up/[[...sign-up]]/page.tsx
  /(onboarding)
    /onboarding/page.tsx
  /(app)
    layout.tsx                    ← Sidebar + Header
    /dashboard/page.tsx
    /leads/page.tsx
    /properties/page.tsx
    /launches/page.tsx
    /events/page.tsx
    /agenda/page.tsx
    /settings/page.tsx
  /api
    /webhooks/clerk/route.ts
    /webhooks/zapi/route.ts
    /cron/check-schedule/route.ts
/components
  /leads/
    LeadCard.tsx
    LeadImportModal.tsx
    QuarantineAlert.tsx
    DailyLeadQueue.tsx
  /properties/
    PropertyForm.tsx
    PropertyCard.tsx
    PhotoUpload.tsx
  /launches/
    LaunchForm.tsx
    LaunchUnitForm.tsx
  /dashboard/
    MetricCard.tsx
    ConversionChart.tsx
    RecentTransfers.tsx
    WorkStatusBadge.tsx
  /agenda/
    AgendaCalendar.tsx
  /shared/
    PageHeader.tsx
    EmptyState.tsx
    LoadingSkeleton.tsx
  /ui/                            ← shadcn components apenas
/lib
  /db/
    index.ts
    schema.ts
  /ai/
    raquel.ts
    scheduler.ts
    notify.ts
    prompts.ts                    ← System prompts da Raquel
  /actions/
    leads.ts
    leads-import.ts
    properties.ts
    launches.ts
    events.ts
    appointments.ts
    email.ts
  /supabase/
    server.ts
  /hooks/
    useLeadQuota.ts
    useWorkSchedule.ts
  zapi.ts
  utils.ts
/emails/
  welcome.tsx
  lead-transferred.tsx
  weekly-report.tsx
  limit-warning.tsx
```

---

## VARIÁVEIS DE AMBIENTE

O arquivo `.env.local` já existe no projeto. Preencha:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Z-API
ZAPI_INSTANCE_ID=
ZAPI_TOKEN=
ZAPI_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# Cron (gere um UUID aleatório)
CRON_SECRET=

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## CHECKLIST DE QUALIDADE

Antes de considerar qualquer feature completa, verifique:

```
[ ] A Server Action valida auth() antes de qualquer operação?
[ ] A query filtra por user_id / userId?
[ ] O formulário usa React Hook Form + schema Zod?
[ ] O componente tem loading state e error state tratados?
[ ] revalidatePath() foi chamado após mutações?
[ ] A UI segue a paleta e tipografia definidas (Syne + DM Sans)?
[ ] Funciona em mobile (min-width: 375px)?
[ ] Nenhuma chave secreta está exposta no client?
[ ] RLS está ativo na tabela correspondente no Supabase?
```

---

## COMPORTAMENTO DO AGENTE

- **Leia antes de agir.** Sempre consulte PRD.md e SPECS.md antes de criar qualquer arquivo.
- **Uma coisa por vez.** Conclua e valide cada item do roadmap antes de avançar para o próximo.
- **Pergunte se ambíguo.** Se um requisito não estiver claro no PRD ou SPECS, pergunte antes de inventar.
- **Sem gambiarras.** Se uma implementação exigir contornar a stack, sinalize e proponha a abordagem correta.
- **Commits descritivos.** Formato: `feat(leads): adicionar validação de quarentena na importação CSV`
- **Design intencional.** Nunca use placeholders de cor, fontes genéricas ou layouts de template. Cada tela deve seguir a identidade visual definida acima.