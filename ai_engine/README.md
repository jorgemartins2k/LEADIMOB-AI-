# Guia de Implantação: Raquel AI Engine (Python)

Este serviço em Python é o "cérebro" da Raquel. Ele deve rodar em um servidor que fique sempre ligado (Always-on). Recomendamos o **Railway.app**.

## 1. Configurando o Ambiente

No Railway (ou no seu servidor), você deve configurar as seguintes **Variáveis de Ambiente** (baseadas no seu `.env.local`):

- `OPENAI_API_KEY`: Sua chave da OpenAI.
- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço (Service Role) do Supabase.
- `ZAPI_INSTANCE_ID`: ID da instância do Z-API.
- `ZAPI_TOKEN`: Token da instância do Z-API.

## 2. Como Fazer o Deploy (Railway)

1. Crie um novo projeto no Railway.
2. Conecte seu repositório do GitHub.
3. Aponte para a pasta `ai_engine/`. O Railway reconhecerá automaticamente o `Dockerfile`.
4. Adicione as variáveis acima nas configurações.
5. Clique em **Deploy**.

## 3. Configurando o Webhook

Após o deploy, o Railway te dará uma URL (ex: `https://ai-engine-production.up.railway.app`).
1. Vá no painel da **Z-API**.
2. Cole esta URL no campo de **Webhook de Mensagens Recebidas**: 
   `https://sua-url-do-railway.app/webhook/zapi`

---

## O que este robô faz agora:

- **Resposta em Tempo Real**: Assim que o cliente manda um Zap, o robô processa e responde usando o seu manual estratégico.
- **Automação de 5 Minutos**: Ele verifica o banco de dados a cada 5 minutos em busca de novos leads ou acompanhamentos pendentes.
- **Alerta de Venda**: Se o robô sentir que o cliente quer visitar, ele manda um Zap exclusivo para o seu WhatsApp avisando: *"Lead Quente detectado!"*.
