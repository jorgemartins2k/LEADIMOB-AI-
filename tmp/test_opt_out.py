import asyncio
import os
import sys

# Assume que estamos rodando da pasta Leadimob-AI ou ai_engine
# Tenta encontrar raquel.py
if os.path.exists('raquel.py'):
    sys.path.append(os.getcwd())
elif os.path.exists('ai_engine/raquel.py'):
    sys.path.append(os.path.abspath('ai_engine'))

from raquel import RaquelAgent
from database import Database

async def test_opt_out():
    print("🧪 Iniciando Teste de Opt-out...")
    raquel = RaquelAgent()
    db = Database()
    
    # 1. Busca um lead existente para teste
    response = db.supabase.table("leads").select("*").limit(1).execute()
    if not response.data:
        print("❌ Nenhum lead encontrado.")
        return
    
    lead = response.data[0]
    phone = lead['phone']
    name = lead.get('name', 'Cliente')
    
    # Reset status para 'active' antes do teste
    db.update_lead_status(phone, "active")
    print(f"📌 Lead de teste: {phone} (Status resetado para 'active')")
    
    # 2. Testa Detecção de Keyword (Pode parar)
    print("\n🔹 Testando detecção por Keyword ('pode parar')...")
    # Nota: O Keyword check é feito no input (message)
    reply = await raquel.process_message(phone, "Pode parar de mandar mensagem, por favor.", name)
    print(f"🤖 Resposta da Raquel: {reply}")
    
    new_status = db.supabase.table("leads").select("status").eq("phone", phone).execute().data[0]['status']
    print(f"📊 Novo Status no Banco: {new_status}")
    if new_status == "opt_out":
        print("✅ SUCESSO: Detecção por keyword funcionou!")
    else:
        print("❌ FALHA: Status deveria ser 'opt_out'.")

    # 3. Testa Interpretação Semântica
    db.update_lead_status(phone, "active")
    print(f"\n📌 Resetando para novo teste semântico...")
    
    print("🔹 Testando detecção Semântica via IA...")
    # Mensagem de desinteresse total para forçar [OPT_OUT]
    reply = await raquel.process_message(phone, "Não tenho interesse em comprar imóveis agora. Pode encerrar o meu contato.", name)
    print(f"🤖 Resposta da Raquel: {reply}")
    
    final_status = db.supabase.table("leads").select("status").eq("phone", phone).execute().data[0]['status']
    print(f"📊 Status Final no Banco: {final_status}")
    if final_status == "opt_out":
        print("✅ SUCESSO: Detecção semântica funcionou!")
    else:
        print("❌ FALHA: Status final deveria ser 'opt_out'.")

if __name__ == "__main__":
    if os.name == 'nt':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    asyncio.run(test_opt_out())
