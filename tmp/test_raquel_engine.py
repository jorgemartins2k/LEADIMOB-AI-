
import asyncio
import os
from dotenv import load_dotenv
from raquel import RaquelAgent

load_dotenv(dotenv_path='.env.local')

async def test():
    raquel = RaquelAgent()
    phone = "5562993596627" # Flanklyn/Jorge Neto numbers from DB
    msg = "Oi Raquel, tudo bem? Quero saber sobre investimentos em Goiânia."
    name = "Teste Jorge"
    
    print(f"--- Iniciando teste para {phone} ---")
    try:
        reply = await raquel.process_message(phone, msg, name)
        print(f"✅ RESPOSTA DA RAQUEL: {reply}")
    except Exception as e:
        print(f"❌ FALHA NO TESTE: {e}")

if __name__ == "__main__":
    asyncio.run(test())
