
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'ai_engine'))

from raquel import RaquelAgent
from dotenv import load_dotenv

load_dotenv(dotenv_path='ai_engine/.env')

try:
    print("Iniciando RaquelAgent...")
    raquel = RaquelAgent()
    print("✅ RaquelAgent iniciada com sucesso!")
except Exception as e:
    import traceback
    print("❌ FALHA NA INICIALIZAÇÃO:")
    traceback.print_exc()
