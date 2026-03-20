"use server";

/**
 * Z-API Integration Utility
 * Handles sending messages via Z-API.
 */

interface SendTextMessageParams {
    phone: string;
    message: string;
}

export async function sendWhatsAppMessage({ phone, message }: SendTextMessageParams) {
    const instanceId = process.env.ZAPI_INSTANCE_ID;
    const token = process.env.ZAPI_TOKEN;
    const clientToken = process.env.ZAPI_CLIENT_TOKEN || "Fda343e96334040afb68f54effe118108S";

    if (!instanceId || !token) {
        console.error("Z-API credentials not configured");
        return { success: false, error: "Credentials missing" };
    }

    const baseUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}`;

    try {
        const response = await fetch(`${baseUrl}/send-text`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Client-Token": clientToken,
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
