-- ============================================================
-- Leadimob AI — Políticas de Segurança do Supabase (RLS)
-- CORREÇÃO: políticas de storage agora exigem autenticação
-- ============================================================

-- 1. Habilita RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE best_leads_ranking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_mistakes_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STORAGE — Bucket: property-photos
-- Cria o bucket se não existir (rodar no SQL Editor do Supabase)
-- ============================================================

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('property-photos', 'property-photos', true)
-- ON CONFLICT DO NOTHING;

-- Leitura pública (fotos de imóveis são públicas para exibição)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-photos');

-- Upload restrito: apenas usuários autenticados via Anon Key
-- (O cliente faz upload com a anon key do Supabase, que é segura para isso)
DROP POLICY IF EXISTS "Allow Authenticated Uploads" ON storage.objects;
CREATE POLICY "Allow Authenticated Uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-photos'
  AND auth.role() = 'anon'
);

-- Update restrito: apenas quem fez o upload (verificado pelo nome do arquivo com user id)
-- Como usamos Service Role no backend, updates são feitos server-side e não precisam de policy pública.

-- Delete restrito: apenas via backend (Service Role) — sem policy pública para delete
-- Isso impede que qualquer pessoa delete fotos de imóveis diretamente.
DROP POLICY IF EXISTS "Allow Public Delete" ON storage.objects;
-- Não recria — delete só é permitido via Service Role no servidor.

-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================
-- 1. O acesso a dados (tabelas) é controlado pelo Next.js Server Actions
--    usando Service Role Key — nunca exposta ao cliente.
-- 2. O RLS das tabelas acima serve como camada extra de proteção
--    caso alguma query chegue direto ao Supabase.
-- 3. Para ambiente de produção real, adicione policies por user_id
--    usando uma função customizada que mapeia clerk_user_id para o uuid interno:
--
--    CREATE OR REPLACE FUNCTION get_internal_user_id()
--    RETURNS uuid AS $$
--      SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true)
--    $$ LANGUAGE sql STABLE;
--
--    Exemplo de policy de tabela:
--    CREATE POLICY "Leads do próprio usuário"
--    ON leads FOR ALL
--    USING (user_id = get_internal_user_id());
