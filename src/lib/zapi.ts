"use server";

/**
 * Z-API Integration Utility
 * Handles sending messages via Z-API.
 * CORREÇÃO: Client Token não tem mais fallback hardcoded — deve estar nas variáveis de ambiente.
 */

interface SendTextMessageParams {
    phone: string;
    message: string;
}

export async function sendWhatsAppMessage({ phone, message }: SendTextMessageParams) {
    const instanceId =
        process.env.ZAPI_INSTANCE_ID ||
        process.env.ID_INSTANCIA_ZAPI ||
        process.env.ID_INSTÂNCIA_ZAPI;

    const token =
        process.env.ZAPI_TOKEN ||
        process.env.ZAPI_TOKEN_WHATSAPP ||
        process.env.ZAPI_TÔKEN;

    const clientToken = process.env.ZAPI_CLIENT_TOKEN;

    if (!instanceId || !token) {
        console.error("[Z-API] ZAPI_INSTANCE_ID ou ZAPI_TOKEN não configurados.");
        return { success: false, error: "Credenciais Z-API ausentes." };
    }

    if (!clientToken) {
        console.error("[Z-API] ZAPI_CLIENT_TOKEN não configurado.");
        return { success: false, error: "ZAPI_CLIENT_TOKEN ausente." };
    }

    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Client-Token": clientToken,
            },
            body: JSON.stringify({ phone, message }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[Z-API] Erro na resposta:", data);
            return { success: false, error: data };
        }

        return { success: true, data };
    } catch (error) {
        console.error("[Z-API] Erro de rede:", error);
        return { success: false, error };
    }
}
