import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export async function getSupabaseWithUser() {
    const { userId } = await auth();
    if (!userId) throw new Error('Não autorizado');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Injeta o user_id no contexto para as RLS policies
    // Nota: Isso assume que você tem uma função no Postgres chamada `set_config` ou similar
    // No Supabase, geralmente usamos `auth.uid()` diretamente em RLS 
    // mas o SPECS.md pede explicitamente este helper com rpc.
    await supabase.rpc('set_config', {
        setting: 'app.current_user_id',
        value: userId,
    });

    return { supabase, clerkUserId: userId };
}
