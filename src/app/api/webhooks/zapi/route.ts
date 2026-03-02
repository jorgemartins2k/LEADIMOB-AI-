import { NextResponse } from "next/server";
import { processLeadMessage } from "@/lib/ai/raquel";

/**
 * Z-API Webhook Receiver
 * Endpoint: /api/webhooks/zapi
 * Receives incoming messages from WhatsApp leads.
 */

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Z-API message structure usually includes:
        // phone, text { message }, isFromMe, etc.
        const { phone, text, isFromMe } = body;

        // Ignore messages sent by the broker/me
        if (isFromMe) {
            return NextResponse.json({ ok: true, message: "Ignored outgoing message" });
        }

        if (!phone || !text?.message) {
            console.warn("Z-API Webhook: Invalid payload", body);
            return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
        }

        // Process the message via Raquel's AI logic
        // We'll implement this function next.
        // Note: We use await here, but for high volume we might want to offload to a queue/job.
        await processLeadMessage({
            phone: phone.replace("@c.us", ""), // Normalize phone
            message: text.message
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Z-API Webhook Error:", error);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}
