import { NextResponse } from 'next/server';
import { getNotificationPreferences, saveNotificationPreferences } from '@/lib/actions/preferences';

export async function GET() {
    const result = await getNotificationPreferences();
    if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, preferences: result.preferences });
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const result = await saveNotificationPreferences(data);
        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Preferences API error:', e);
        return NextResponse.json({ error: e.message || 'Erro ao processar.' }, { status: 500 });
    }
}
