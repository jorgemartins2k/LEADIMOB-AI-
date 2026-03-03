# Leadimob AI - Gestão Imobiliária Inteligente

O **Leadimob AI** é um ecossistema de gestão imobiliária projetado para corretores e agências, integrando Inteligência Artificial e automação de WhatsApp para acelerar vendas e organizar o atendimento.

## 🚀 Funcionalidades Principal

- **Raquel AI**: Assistente virtual integrada ao WhatsApp (via Z-API) que atende leads, responde dúvidas técnicas sobre imóveis e identifica oportunidades aquecidas usando GPT-4o.
- **Gestão de Inventário**: CRUD completo para Imóveis e Lançamentos, com suporte a plantas/unidades e galeria de fotos.
- **Funil de Vendas & Leads**: Gestão de contatos com sistema de quarentena programada.
- **Agenda Inteligente**: Calendário interativo para workshops, visitas e reuniões.
- **Configurações de Expediente**: Controle de disponibilidade para atendimento automático.

## 🛠️ Tecnologias

- **Framework**: [Next.js 14/15](https://nextjs.org/) (App Router + Turbopack)
- **Autenticação**: [Clerk](https://clerk.com/)
- **Banco de Dados**: [Supabase](https://supabase.com/) & [Drizzle ORM](https://orm.drizzle.team/)
- **IA**: [OpenAI GPT-4o](https://openai.com/)
- **WhatsApp**: [Z-API](https://z-api.io/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)

## ⚙️ Configuração Local

1. Clone o repositório:
```bash
git clone https://github.com/jorgemartins2k/LEADIMOB-AI-.git
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Copie o `.env.example` para `.env.local` e preencha as chaves do Clerk, Supabase, OpenAI e Z-API.

4. Sincronize o banco de dados:
```bash
npx drizzle-kit push
```

5. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

## 📄 Licença

Este projeto é privado e de uso exclusivo da Leadimob.
