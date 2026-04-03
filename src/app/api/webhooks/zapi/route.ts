import { NextResponse } from "next/server";
import { processLeadMessage } from "@/lib/ai/raquel";

/**
 * Z-API Webhook Receiver
 * Endpoint: /api/webhooks/zapi
 * Receives incoming messages from WhatsApp leads (Text & Audio).
 * Suporte: v1 + v2 (Text/Audio)
 */

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Z-API message structure
        // phone: "55..."
        // text: { message: "..." }
        // audio: { url: "..." }
        // isFromMe: boolean
        const { phone, text, audio, isFromMe } = body;

        // Ignore messages sent by the broker/me
        if (isFromMe) {
            return NextResponse.json({ ok: true, message: "Ignored outgoing message" });
        }

        const messageText = text?.message || "";
        const audioUrl = audio?.url || "";

        if (!phone || (!messageText && !audioUrl)) {
            console.warn("[Z-API Webhook] Payload inválido ou vazio:", body);
            return NextResponse.json({ ok: false, error: "Payload inválido" }, { status: 400 });
        }

        // Process the message via Raquel's AI logic
        // Normalizamos o telefone para remover o sufixo do WhatsApp se presente
        const normalizedPhone = phone.replace("@c.us", "").replace("@s.whatsapp.net", "");

        await processLeadMessage({
            phone: normalizedPhone,
            message: messageText,
            audioUrl: audioUrl,
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[Z-API Webhook] Erro crítico:", error);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}
