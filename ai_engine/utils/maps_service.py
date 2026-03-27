import requests
import os
from typing import List, Dict, Any, Optional

class MapsService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    def find_nearby_places(self, query: str, location: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Pesquisa locais (escolas, hospitais, etc.) próximos a uma localização específica usando Google Maps Text Search.
        """
        if not self.api_key:
            print("⚠️ Erro: GOOGLE_MAPS_API_KEY não configurada.")
            return []

        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        
        # Se houver uma localização (ex: "perto do Hospital Albert Einstein em Goiânia") 
        # o Text Search é ideal pois aceita linguagem natural
        params = {
            "query": f"{query} {location}" if location else query,
            "key": self.api_key,
            "language": "pt-BR"
        }

        try:
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if data.get("status") == "OK":
                results = data.get("results", [])
                formatted_results = []
                for p in results[:5]: # Limita aos 5 melhores
                    formatted_results.append({
                        "name": p.get("name"),
                        "address": p.get("formatted_address"),
                        "rating": p.get("rating"),
                        "user_ratings_total": p.get("user_ratings_total")
                    })
                return formatted_results
            else:
                print(f"⚠️ Google Maps API Status: {data.get('status')} - {data.get('error_message', '')}")
                return []
        except Exception as e:
            print(f"❌ Erro na consulta ao Google Maps: {e}")
            return []
