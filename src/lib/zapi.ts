"use server";

/**
 * Z-API Integration Utility
 * Handles sending messages via Z-API.
 */

const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const ZAPI_BASE_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}`;

interface SendTextMessageParams {
    phone: string;
    message: string;
}

export async function sendWhatsAppMessage({ phone, message }: SendTextMessageParams) {
    if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
        console.error("Z-API credentials not configured");
        return { success: false, error: "Credentials missing" };
    }

    try {
        const response = await fetch(`${ZAPI_BASE_URL}/send-text`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                phone: phone,
                message: message,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Z-API Error:", data);
            return { success: false, error: data };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Z-API Fetch Error:", error);
        return { success: false, error };
    }
}
