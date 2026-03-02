import { sendWhatsAppMessage } from "@/lib/zapi";

interface NotifyBrokerParams {
    lead: {
        name: string;
        phone: string;
    };
    broker: {
        name: string;
        whatsapp: string | null;
    };
    reason: "warm" | "pass_broker";
}

export async function notifyBrokerByWhatsApp({ lead, broker, reason }: NotifyBrokerParams) {
    if (!broker.whatsapp) {
        console.warn(`Broker ${broker.name} has no WhatsApp configured for notification.`);
        return;
    }

    const message = `🔥 *Lead Aquecido - Raquel AI*\n\n` +
        `Nome: ${lead.name}\n` +
        `Telefone: ${lead.phone}\n` +
        `Motivo: ${reason === "warm" ? "Demonstrou alto interesse" : "Solicitou falar com o corretor"}\n\n` +
        `Assuma o atendimento conforme necessário.`;

    try {
        const result = await sendWhatsAppMessage({
            phone: broker.whatsapp,
            message
        });

        if (result.success) {
            console.log(`Notification sent to broker ${broker.name} for lead ${lead.name}`);
        } else {
            console.error(`Failed to notify broker ${broker.name}:`, result.error);
        }
    } catch (error) {
        console.error(`Error in notifyBrokerByWhatsApp:`, error);
    }
}
