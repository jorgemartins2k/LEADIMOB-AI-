# PRD - Leadimob AI

## 1. VISÃO DO PRODUTO

A Leadimob AI é uma plataforma SaaS B2C para corretores imobiliários que automatiza o primeiro contato com leads via WhatsApp através de uma IA consultiva chamada Raquel. O corretor centraliza seus leads, imóveis, lançamentos e agenda em um único painel — e a Raquel qualifica os clientes, oferece imóveis com base no perfil e aquece o lead até o ponto de agendamento, passando o contato ao corretor no momento certo.

## 2. OBJETIVOS DE NEGÓCIO

- Reduzir o tempo que o corretor gasta em atendimentos frios e repetitivos, deixando-o focar em visitas e fechamentos
- Aumentar a taxa de conversão de leads por meio de atendimento imediato, personalizado e consultivo via WhatsApp
- Criar uma receita recorrente (MRR) por meio de planos mensais escalonáveis com limite de leads
- Posicionar a Leadimob AI como o CRM inteligente padrão para corretores autônomos e pequenas imobiliárias

## 3. PERSONAS

### Corretor Autônomo — "Carlos"
- Corretor experiente, atende de 30 a 80 leads por mês
- Perde oportunidades por não responder leads rápido o suficiente
- Não tem equipe de SDR nem assistente
- Necessidade principal: ter alguém (ou algo) que faça o primeiro contato e filtre os leads quentes para ele fechar

### Corretor de Imobiliária — "Priscila"
- Trabalha em imobiliária de médio porte, recebe leads de portais e eventos de lançamento
- Precisa organizar sua carteira de leads e evitar retrabalho em contatos já abordados
- Necessidade principal: não abordar o mesmo lead duas vezes e ter um histórico organizado de cada contato

## 4. FUNCIONALIDADES CORE

---

### 4.1 Autenticação (Clerk)

- Login e cadastro com e-mail/senha
- OAuth com Google
- Sessão persistente com proteção de rotas
- Perfil do corretor (nome, WhatsApp, imobiliária, foto)

---

### 4.2 Planos e Limite de Leads

**Descrição:**
Cada corretor assina um plano que define o número máximo de leads mensais e, consequentemente, a cota diária de leads que pode ser ativada para a IA abordar.

**Planos:**
| Plano | Leads Mensais | Leads Diários (approx.) |
|-------|--------------|------------------------|
| Start | 1.500 | ~50/dia |
| Pro   | 3.000 | ~100/dia |
| Elite | 5.000 | ~167/dia |

**Requisitos:**
- A cota diária é calculada automaticamente com base no plano e nos dias de trabalho configurados
- O sistema exibe o saldo atual de leads do mês (usados / total)
- Ao atingir o limite mensal, novos leads não são aceitos até o próximo ciclo
- O ciclo reinicia no dia 1 de cada mês

**Fluxo do usuário:**
1. Corretor faz login e acessa o Dashboard
2. Visualiza cards com "Leads disponíveis hoje", "Leads usados no mês" e "Leads restantes no mês"
3. Ao importar ou adicionar leads, o sistema valida o saldo antes de aceitar

---

### 4.3 Gestão de Leads

**Descrição:**
O corretor gerencia sua lista diária de leads, podendo adicionar manualmente ou importar via arquivo. O sistema aplica a regra de quarentena de 15 dias para evitar recontato com o mesmo número.

**Requisitos:**
- Adição manual de lead (nome, telefone, origem)
- Importação via CSV/XLSX com mapeamento automático de colunas
- Quarentena de 15 dias por número de telefone: o sistema bloqueia o lead e exibe alerta ao tentar cadastrá-lo novamente
- Na importação em lote, leads em quarentena são pulados automaticamente e as vagas são preenchidas pelos próximos leads válidos da lista
- Cada lead possui status: `aguardando`, `em atendimento`, `aquecido`, `transferido`, `descartado`
- Ao final do expediente (configurado pelo corretor), a lista diária é encerrada e o espaço é liberado para o dia seguinte
- Histórico de leads por dia disponível para consulta

**Fluxo do usuário:**
1. Corretor acessa a aba "Leads do Dia"
2. Adiciona manualmente ou importa arquivo de leads
3. Sistema valida quarentena e saldo disponível
4. Lista confirmada aparece como fila para a IA abordar no início do expediente

---

### 4.4 Configuração de Expediente

**Descrição:**
O corretor define os dias da semana que trabalha e os horários de início e fim do expediente. A IA só ativa os atendimentos dentro desse janela.

**Requisitos:**
- Seleção de dias da semana (checkboxes: Seg, Ter, Qua, Qui, Sex, Sáb, Dom)
- Horário de início e fim por dia (ex: 09:00 às 18:00)
- Possibilidade de horários diferentes por dia da semana
- Ao atingir o horário de início, a IA começa a abordar a fila de leads automaticamente
- Ao atingir o horário de fim, a IA para de enviar novas mensagens e a lista diária é encerrada

**Fluxo do usuário:**
1. Corretor acessa "Configurações > Expediente"
2. Marca os dias que trabalha
3. Define horário de início e fim para cada dia selecionado
4. Salva — o sistema usa essa agenda para acionar a IA automaticamente

---

### 4.5 Carteira de Imóveis

**Descrição:**
O corretor cadastra os imóveis disponíveis em sua carteira. A IA usa essas informações para ofertar ao lead o imóvel mais adequado ao seu perfil.

**Requisitos:**
- Cadastro de imóvel com: título, descrição, tipo (apartamento, casa, terreno, comercial), localização (cidade, bairro, endereço), valor, área (m²), quartos, vagas, padrão (pequeno, médio, alto padrão), público-alvo (primeiro imóvel, empreendedor, família, aposentado)
- Upload de até 10 fotos por imóvel (Supabase Storage)
- Status do imóvel: disponível / vendido / em negociação
- A IA acessa os imóveis disponíveis e os filtra por correspondência com o perfil do lead identificado na conversa

**Fluxo do usuário:**
1. Corretor acessa "Meus Imóveis > Adicionar Imóvel"
2. Preenche formulário completo com fotos
3. Imóvel fica disponível na base da IA imediatamente

---

### 4.6 Lançamentos Imobiliários

**Descrição:**
O corretor cadastra lançamentos de empreendimentos — projetos em construção ou pré-lançamento — com informações detalhadas que a IA utiliza no atendimento.

**Requisitos:**
- Campos: nome do empreendimento, construtora, descrição, localização, valor a partir de, previsão de entrega, padrão, público-alvo, status (pré-lançamento / lançamento / em obras)
- Upload de fotos do empreendimento
- Suporte a múltiplas plantas dentro do mesmo lançamento: cada planta tem nome (ex: "Studio 28m²"), metragem, quartos, vagas e valor
- A IA pode apresentar diferentes plantas conforme o perfil e orçamento do lead

**Fluxo do usuário:**
1. Corretor acessa "Lançamentos > Novo Lançamento"
2. Preenche dados gerais do empreendimento
3. Adiciona as plantas disponíveis dentro do lançamento
4. Salva — disponível para a IA usar no atendimento

---

### 4.7 Eventos da Imobiliária

**Descrição:**
O corretor cadastra eventos (plant tours, feirões, dias de visita) que a IA pode promover para leads com perfil compatível.

**Requisitos:**
- Campos: nome do evento, data, horário, local, descrição, público-alvo, padrão (pequeno, médio, alto padrão)
- A IA menciona eventos relevantes ao lead com base no perfil identificado
- Eventos vencidos (data passada) são arquivados automaticamente

**Fluxo do usuário:**
1. Corretor acessa "Eventos > Novo Evento"
2. Preenche os dados e salva
3. Evento aparece na base da IA até a data de realização

---

### 4.8 Agenda do Corretor

**Descrição:**
Calendário pessoal do corretor para registrar visitas agendadas e compromissos gerados pelo atendimento da IA ou manualmente.

**Requisitos:**
- Visualização em formato calendário (dia / semana / mês)
- Criação manual de compromissos (título, data, hora, lead associado, imóvel/lançamento, observações)
- Quando a IA transfere um lead aquecido, o corretor recebe notificação via WhatsApp — ao confirmar, a visita pode ser adicionada à agenda
- Integração visual com os leads transferidos pela Raquel

---

### 4.9 IA Raquel — Atendimento via WhatsApp (Z-API)

**Descrição:**
A Raquel é a assistente de IA do corretor. Ela opera através de um número WhatsApp da Leadimob AI via Z-API, se apresentando como assistente do corretor pelo nome. Seu objetivo é qualificar o lead, identificar perfil e oferecer imóveis/lançamentos/eventos compatíveis, agendando visitas e transferindo o lead aquecido ao corretor.

**Requisitos:**
- A Raquel opera via GPT-4 (OpenAI) + Z-API (WhatsApp Business)
- Ao iniciar o expediente do corretor, a Raquel começa a abordar os leads da fila na ordem
- Tom: consultivo, educado, persuasivo, quebrador de objeções
- Apresentação: "Olá [nome do lead]! Meu nome é Raquel, sou assistente do corretor [nome do corretor]..."
- Quando perguntada se é humana ou IA, a Raquel admite ser assistente virtual
- A Raquel não revela detalhes do sistema, não desvia do assunto imobiliário e sempre retorna ao tema com educação
- Quando o lead demonstra interesse real em visita ou reunião, a Raquel notifica o corretor via WhatsApp com: nome do lead, número, resumo do interesse e aguarda confirmação ("OK")
- Se o corretor não responder em 5 minutos, a Raquel reenvia a notificação
- Se o lead perguntar sobre financiamento, entrada ou parcelas com dados que a IA não consegue calcular, a Raquel passa para o corretor automaticamente
- A Raquel busca dados reais do banco do corretor (imóveis, lançamentos, fotos, valores, localização) para usar nas conversas

**Fluxo do usuário:**
1. Expediente inicia → Raquel começa a contatar os leads da fila
2. Raquel conduz conversa consultiva, identifica perfil (primeiro imóvel? família? ticket médio?)
3. Raquel oferta imóveis/lançamentos/eventos compatíveis com fotos e dados reais
4. Ao aquecer o lead → notifica corretor via WhatsApp
5. Corretor responde "OK" → assume o atendimento direto
6. Fim do expediente → lista encerrada, espaço liberado

---

### 4.10 Dashboard Principal

**Descrição:**
Painel central com visão geral da operação do corretor no dia e no mês.

**Requisitos:**
- Cards de métricas: leads do dia, leads abordados, leads transferidos, leads restantes no mês
- Gráfico de conversão semanal (leads abordados x transferidos)
- Lista dos últimos leads transferidos pela Raquel
- Alertas de expediente (ativo/inativo)
- Acesso rápido às abas principais

## 5. REQUISITOS NÃO-FUNCIONAIS

- **Performance:** Dashboard carrega em menos de 2s; mensagens da IA enviadas em até 3s após gatilho
- **Segurança:** Cada corretor acessa apenas seus próprios dados (RLS no Supabase); tokens JWT gerenciados pelo Clerk
- **Escalabilidade:** Suporte a 10.000+ corretores simultâneos com isolamento por usuário
- **Responsividade:** Interface funciona em desktop e mobile (tablet e smartphone)
- **Disponibilidade:** SLA de 99,5% — uptime crítico no horário de expediente dos corretores
- **Privacidade:** Dados de leads e conversas são privados e exclusivos de cada corretor

## 6. FORA DO ESCOPO V1

❌ App mobile nativo (iOS/Android)
❌ Integração com portais imobiliários (Zap, Viva Real) para importação automática de leads
❌ Multi-usuário por conta (um corretor = uma conta)
❌ Pagamentos dentro da plataforma (Stripe/Asaas) — cobrado externamente na V1
❌ Relatórios avançados com BI
❌ Integração com CRMs externos (Hubspot, Pipedrive)
❌ Raquel em outros canais além do WhatsApp (Instagram, e-mail)

## 7. ONBOARDING

**Fluxo:**
1. Corretor acessa leadimob.ai e faz cadastro com e-mail ou Google (Clerk)
2. Preenche perfil: nome completo, WhatsApp pessoal, nome da imobiliária (opcional)
3. Seleciona o plano (Start / Pro / Elite)
4. Configura o expediente (dias e horários de trabalho)
5. Cadastra ao menos 1 imóvel ou lançamento
6. Importa ou adiciona os primeiros leads
7. Raquel entra em ação no próximo início de expediente

**Checklist de Primeiros Passos (exibido no dashboard):**
- [ ] Completar o perfil do corretor
- [ ] Configurar dias e horários de expediente
- [ ] Cadastrar pelo menos 1 imóvel ou lançamento
- [ ] Adicionar os primeiros leads do dia
- [ ] Aguardar o início do expediente e acompanhar a Raquel em ação

## 8. MÉTRICAS DE SUCESSO

- **Ativação:** % de corretores que completam o onboarding e adicionam leads na 1ª semana → Meta: 70%
- **Retenção M1:** % de corretores ativos no 1º mês após cadastro → Meta: 60%
- **Taxa de transferência:** % de leads abordados que são transferidos para o corretor → Meta: 15%
- **Churn mensal:** % de cancelamentos → Meta: < 5%
- **NPS:** Net Promoter Score → Meta: > 50
- **MRR:** Receita recorrente mensal → Meta: R$ 50.000 em 6 meses
