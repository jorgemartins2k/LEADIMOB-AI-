import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(dotenv_path="ai_engine/.env")

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
        
        print("⏳ Apagando memória de conversas de todos os corretores...")
        result = supabase.table("conversations").delete().lt("sent_at", future).execute()
        
        print(f"✅ Memória limpa com sucesso! {len(result.data)} mensagens removidas.")
    except Exception as e:
        print(f"❌ Erro ao limpar memória: {e}")

if __name__ == "__main__":
    clear_all_conversations()
