import os
from openai import OpenAI
from dotenv import load_dotenv
from database import Database
import requests

load_dotenv()

class RaquelAgent:
    def __init__(self):
        # Validação robusta de chaves
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("❌ ERRO CRÍTICO: Variável 'OPENAI_API_KEY' não encontrada no ambiente!")
            print("Vá no painel do Railway > Seu Serviço > Variables e adicione a chave.")
            raise RuntimeError("OPENAI_API_KEY ausente.")

        self.client = OpenAI(api_key=api_key)
        self.db = Database()

    def get_system_prompt(self, context, lead_name):
        broker_name = context.get('broker_name', 'Corretor')
        creci = context.get('broker_creci', 'Não informado')
        agency = context.get('broker_agency', 'Autônomo')
        presentation = context.get('broker_presentation', '')

        return f"""
        IDENTIDADE E APRESENTAÇÃO:
        Você é Raquel, a assistente virtual oficial do corretor {broker_name}. 
        Apresente-se sempre como assistente dele(a). Nunca revele ser uma IA. 
        Dados do Corretor para Credibilidade:
        - Nome: {broker_name}
        - CRECI: {creci}
        - Imobiliária/Agência: {agency}
        
        TEXTO DE APRESENTAÇÃO DO CORRETOR (Use isso para moldar seu tom e conhecimento):
        {presentation}

        Tom profissional, acolhedor e empático.

        FLUXO DE CONVERSA ATIVA:
        Objetivo: Despertar interesse genuíno e conduzir à visita presencial.
        - Analise as necessidades do lead {lead_name}.
        - Se o cliente desviar, redirecione gentilmente para o tema imobiliário.
        - Envie até 3 opções de imóveis do portfólio quando relevante.

        QUALIFICAÇÃO FINANCEIRA:
        ...
        REGRAS DE OURO:
        - VOCÊ NÃO AGENDA VISITAS. 
        - QUANDO O LEAD QUISER VISITAR OU DEMONSTRAR ALTO INTERESSE, use o comando interno [ALERT_BROKER] no final da sua resposta.
        - Nunca invente preços ou dados técnicos. Use o que estiver no sistema.
        """

    def process_message(self, phone, message, sender_name):
        # 1. Busca dados do corretor e lead com perfil completo
        context = self.db.get_broker_by_lead_phone(phone)
        if not context:
            return "Lead não encontrado no banco."

        user_id = context['user_id']
        lead_real_name = context['lead_name']

        # 2. Busca histórico e portfólio
        history = self.db.get_chat_history(phone)
        portfolio = self.db.get_portfolio(user_id)

        # 3. Monta as mensagens para a OpenAI usando o novo contexto
        messages = [{"role": "system", "content": self.get_system_prompt(context, lead_real_name)}]
        
        # Adiciona portfólio como contexto
        portfolio_text = "PORTFÓLIO DISPONÍVEL:\n" + str(portfolio)
        messages.append({"role": "system", "content": portfolio_text})

        # Adiciona histórico
        for h in history:
            messages.append({"role": h['role'], "content": h['content']})

        # Adiciona nova mensagem
        messages.append({"role": "user", "content": message})

        # 4. Gera resposta
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        
        reply_content = response.choices[0].message.content

        # 5. Salva no banco
        self.db.save_message(phone, "user", message)
        self.db.save_message(phone, "assistant", reply_content)

        # 6. Verifica se precisa alertar o corretor
        if "[ALERT_BROKER]" in reply_content:
            clean_reply = reply_content.replace("[ALERT_BROKER]", "").strip()
            self.send_to_zapi(phone, clean_reply)
            self.alert_broker(context, clean_reply)
            return clean_reply
        
        # 7. Enviar via Z-API normalmente
        self.send_to_zapi(phone, reply_content)
        
        return reply_content

    def alert_broker(self, context, message_context):
        """
        Envia um alerta para o WhatsApp do Corretor
        """
        broker_whatsapp = context['broker_whatsapp']
        lead_name = context['lead_name']
        
        alert_msg = f"🚨 *LEAD QUENTE: {lead_name}*\n\nEste lead demonstrou alto interesse ou pediu visita!\n\n*Resumo da conversa:* {message_context[:100]}...\n\nAssuma o atendimento agora!"
        self.send_to_zapi(broker_whatsapp, alert_msg)

    def send_to_zapi(self, phone, content):
        """
        Envia a mensagem via Z-API usando as chaves do .env.local
        """
        instance_id = os.getenv("ZAPI_INSTANCE_ID")
        token = os.getenv("ZAPI_TOKEN")
        url = f"https://api.z-api.io/instances/{instance_id}/token/{token}/send-text"
        
        payload = {
            "phone": phone,
            "message": content
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            print(f"Mensagem enviada para {phone} via Z-API.")
        except Exception as e:
            print(f"Erro ao enviar para Z-API de {phone}: {e}")
