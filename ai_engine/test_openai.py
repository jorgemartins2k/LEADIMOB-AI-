import os
from openai import OpenAI
from dotenv import load_dotenv

def test_key():
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("❌ ERRO: OPENAI_API_KEY não encontrada no arquivo .env")
        return

    print(f"🔍 Testando chave: {api_key[:10]}...{api_key[-5:]}")
    
    client = OpenAI(api_key=api_key)
    
    try:
        # Teste simples: listar modelos ou fazer uma completion pequena
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Olá, você está funcionando?"}],
            max_tokens=10
        )
        print("✅ SUCESSO! A Raquel conseguiu se conectar com a OpenAI.")
        print(f"Resposta: {response.choices[0].message.content}")
        
    except Exception as e:
        print("❌ FALHA: A OpenAI retornou um erro.")
        print(f"Detalhes: {e}")
        
        if "401" in str(e):
            print("\n💡 DICA: O erro 401 significa que a chave está incorreta ou foi revogada.")
        elif "429" in str(e):
            print("\n💡 DICA: O erro 429 significa que você acabou seus créditos ou está sem saldo na OpenAI.")

if __name__ == "__main__":
    test_key()
