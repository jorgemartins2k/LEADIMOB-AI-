import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='../.env.local')
db_url = os.getenv('DATABASE_URL')
if not db_url:
    print('DATABASE_URL not found')
    exit(1)

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("DELETE FROM conversations;")
    deleted_convs = cur.rowcount
    
    cur.execute("DELETE FROM ai_mistakes_log;")
    deleted_mistakes = cur.rowcount
    
    cur.execute("DELETE FROM best_leads_ranking;")
    deleted_rankings = cur.rowcount
    
    cur.execute("DELETE FROM broker_notifications;")
    deleted_notifs = cur.rowcount
    
    cur.execute("UPDATE leads SET status = 'active', updated_at = NOW() WHERE status != 'completed';")
    updated_leads = cur.rowcount
    
    conn.commit()
    cur.close()
    conn.close()
    
    print(f'✅ Conversas apagadas: {deleted_convs}')
    print(f'✅ Erros IA apagados: {deleted_mistakes}')
    print(f'✅ Rankings apagados: {deleted_rankings}')
    print(f'✅ Notificações apagadas: {deleted_notifs}')
    print(f'✅ Leads resetados (status = active): {updated_leads}')
    
except Exception as e:
    print(f'❌ Erro: {e}')
