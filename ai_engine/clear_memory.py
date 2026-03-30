import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env.local")

def clear_all_conversations():
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("Erro: Credenciais do Supabase não encontradas.")
        return

    supabase: Client = create_client(url, key)
    
    try:
        # Deletar todas as mensagens da tabela de conversas
        # Como não temos uma deleção sem filtros liberada por padrão, 
        # usamos um filtro que pegue tudo (ex: sent_at < next year)
        from datetime import datetime
        future = "2099-01-01T00:00:00"
        
        print("⏳ Apagando memória de conversas...")
        r1 = supabase.table("conversations").delete().lt("sent_at", future).execute()
        
        print("⏳ Apagando aprendizados de erros anteriores...")
        r2 = supabase.table("ai_mistakes_log").delete().lt("created_at", future).execute()
        
        print("⏳ Apagando rankings de melhores leads (memória de follow-ups geniais)...")
        r3 = supabase.table("best_leads_ranking").delete().gt("rank", 0).execute()
        
        print("⏳ Apagando notificações de follow-up antigas...")
        r4 = supabase.table("broker_notifications").delete().lt("created_at", future).execute()

        print("⏳ Resetando status da fila de atendimento e contadores de tempo de follow-up...")
        # Atualiza status para active para tirar de espera (follow_up_pending, waiting, etc)
        r5 = supabase.table("leads").update({"status": "active", "updated_at": "now()"}).neq("status", "fake_status").execute()
        
        print(f"✅ Reset completo realizado com sucesso!")
        print(f"   - {len(r1.data)} mensagens apagadas.")
        print(f"   - {len(r2.data)} logs de erro apagados.")
        print(f"   - {len(r3.data)} perfis de ranking apagados.")
        print(f"   - {len(r4.data)} notificações resetadas.")
        print(f"   - {len(r5.data)} leads reiniciados para follow-up.")
    except Exception as e:
        print(f"❌ Erro ao limpar memória: {e}")

if __name__ == "__main__":
    clear_all_conversations()
