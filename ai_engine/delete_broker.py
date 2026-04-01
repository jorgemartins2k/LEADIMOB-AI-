
import os
from database import Database

def delete_broker_by_email(email: str):
    db = Database()
    if not db.supabase:
        print("Erro: Supabase nao inicializado.")
        return

    # 1. Busca o usuario pelo e-mail
    response = db.supabase.table("users").select("id, name").eq("email", email).execute()
    
    if not response.data:
        print(f"Usuario com e-mail {email} nao encontrado.")
        return

    user = response.data[0]
    user_id = user['id']
    user_name = user['name']

    print(f"Encontrado: {user_name} (ID: {user_id})")
    
    # 2. Deleta o usuario (O cascade no banco cuidara do resto)
    delete_response = db.supabase.table("users").delete().eq("id", user_id).execute()
    
    if delete_response.data:
        print(f"Sucesso: Corretor {user_name} ({email}) excluido com sucesso.")
    else:
        print("Erro ao excluir o corretor.")

if __name__ == "__main__":
    delete_broker_by_email("jorgemartins2k@gmail.com")
