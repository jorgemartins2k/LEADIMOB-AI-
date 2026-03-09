# Script de Configuração Automatizada - Raquel AI Engine
# Este script cria o ambiente Python, instala dependências e prepara o .env

Write-Host "🚀 Iniciando configuração do ambiente da Raquel..." -ForegroundColor Cyan

# 1. Verifica se o Python está instalado
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Erro: Python não encontrado. Por favor, instale o Python em python.org antes de continuar." -ForegroundColor Red
    exit
}

# 2. Cria o ambiente virtual (.venv)
if (!(Test-Path ".venv")) {
    Write-Host "📦 Criando ambiente virtual (.venv)..." -ForegroundColor Yellow
    python -m venv .venv
} else {
    Write-Host "✅ Ambiente virtual já existe." -ForegroundColor Green
}

# 3. Instala dependências
Write-Host "⬇️ Instalando bibliotecas (requirements.txt)..." -ForegroundColor Yellow
& .\.venv\Scripts\pip install -r requirements.txt

# 4. Cria template .env se não existir
if (!(Test-Path ".env")) {
    Write-Host "📝 Criando arquivo .env a partir do template..." -ForegroundColor Yellow
    if (Test-Path ".env.local") {
        # Copia do root se existir
        Copy-Item "../.env.local" ".env"
    } else {
        # Cria um novo do zero
        $envTemplate = @"
OPENAI_API_KEY=sua_chave_aqui
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_key_service_role
ZAPI_INSTANCE_ID=sua_instancia
ZAPI_TOKEN=seu_token
"@
        Set-Content -Path ".env" -Value $envTemplate
    }
}

Write-Host "`n✨ TUDO PRONTO! ✅" -ForegroundColor Green
Write-Host "Para rodar o teste de conexão, execute:"
Write-Host ".\.venv\Scripts\python test_openai.py`n"
Write-Host "Para rodar o motor da Raquel, execute:"
Write-Host ".\.venv\Scripts\python main.py" -ForegroundColor Cyan
Write-Host "`n💡 Lembre-se de selecionar este ambiente (.venv) no VS Code clicando no nome do Python no canto inferior direito."
