import os
from openai import OpenAI # pyre-ignore
from dotenv import load_dotenv # pyre-ignore

load_dotenv()

def test_key():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found in .env file")
        return

    print(f"Testing key starting with: {api_key[:12]}...") # pyre-ignore
    
    try:
        client = OpenAI(api_key=api_key)
        # Test with a lightweight call
        response = client.models.list()
        print("SUCCESS: API Key is valid and working!")
        print("Available models check: OK")
    except Exception as e:
        print(f"FAILED: Connection to OpenAI failed.")
        print(f"Error detail: {e}")
        
        if "401" in str(e):
            print("\nTIP: Error 401 means the key is incorrect. Check if you copied any extra spaces or if the key was revoked.")
        elif "429" in str(e):
            print("\nTIP: Error 429 means you hit a rate limit or ran out of credits. Check your balance at https://platform.openai.com/usage")

if __name__ == "__main__":
    test_key()
