"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { properties, users } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const propertySchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    description: z.string().optional(),
    type: z.enum(["apartamento", "casa", "terreno", "comercial"]),
    city: z.string().min(2, "Informe a cidade"),
    neighborhood: z.string().optional(),
    address: z.string().optional(),
    price: z.string().refine((val) => !isNaN(Number(val)), "Preço inválido"),
    areaSqm: z.string().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    parkingSpots: z.number().optional(),
    standard: z.enum(["economico", "medio", "alto"]),
    targetAudience: z.array(z.string()).default([]),
    photos: z.array(z.string()).default([]),
    minhaCasaMinhaVida: z.boolean().default(false),
    allowsFinancing: z.boolean().default(false),
    downPayment: z.string().optional(),
    condoFee: z.string().optional(),
    isCondo: z.boolean().default(false),
});

import { getOrCreateInternalUser } from "@/lib/auth-utils";

export async function getProperties() {
    const user = await getOrCreateInternalUser();
    return db.query.properties.findMany({
        where: and(eq(properties.userId, user.id)),
        orderBy: [desc(properties.createdAt)],
    });
}

export async function createProperty(data: z.infer<typeof propertySchema>) {
    try {
        const user = await getOrCreateInternalUser();
        const validated = propertySchema.parse(data);

        await db.insert(properties).values({
            userId: user.id,
            title: validated.title,
            description: validated.description,
            type: validated.type,
            city: validated.city,
            neighborhood: validated.neighborhood,
            address: validated.address,
            price: validated.price.replace(/[^\d.]/g, ''),
            areaSqm: validated.areaSqm,
            bedrooms: validated.bedrooms,
            bathrooms: validated.bathrooms,
            parkingSpots: validated.parkingSpots,
            standard: validated.standard,
            targetAudience: validated.targetAudience,
            photos: validated.photos,
            minhaCasaMinhaVida: validated.minhaCasaMinhaVida,
            allowsFinancing: validated.allowsFinancing,
            downPayment: validated.downPayment,
            condoFee: validated.condoFee,
            isCondo: validated.isCondo,
        });

        revalidatePath("/imoveis");
        return { success: true };
    } catch (err: any) {
        console.error(err);
        return { error: err.message || "Erro ao salvar imóvel." };
    }
}

export async function updateProperty(id: string, data: z.infer<typeof propertySchema>) {
    try {
        const user = await getOrCreateInternalUser();
        const validated = propertySchema.parse(data);

        await db.update(properties)
            .set({
                title: validated.title,
                description: validated.description,
                type: validated.type,
                city: validated.city,
                neighborhood: validated.neighborhood,
                address: validated.address,
                price: validated.price.replace(/[^\d.]/g, ''),
                areaSqm: validated.areaSqm,
                bedrooms: validated.bedrooms,
                bathrooms: validated.bathrooms,
                parkingSpots: validated.parkingSpots,
                standard: validated.standard,
                targetAudience: validated.targetAudience,
                photos: validated.photos,
                minhaCasaMinhaVida: validated.minhaCasaMinhaVida,
                allowsFinancing: validated.allowsFinancing,
                downPayment: validated.downPayment,
                condoFee: validated.condoFee,
                isCondo: validated.isCondo,
                updatedAt: new Date(),
            })
            .where(and(eq(properties.id, id), eq(properties.userId, user.id)));

        revalidatePath("/imoveis");
        revalidatePath(`/imoveis/${id}`);
        return { success: true };
    } catch (err: any) {
        console.error(err);
        return { error: err.message || "Erro ao atualizar imóvel." };
    }
}


export async function deleteProperty(id: string) {
    const user = await getOrCreateInternalUser();

    await db
        .delete(properties)
        .where(and(eq(properties.id, id), eq(properties.userId, user.id)));

    revalidatePath("/imoveis");
    return { success: true };
}

export async function getPropertyById(id: string) {
    try {
        const user = await getOrCreateInternalUser();
        // SQL robusto para evitar erros de serialização no Next.js 15 Edge/Serverless
        const result = await db.execute(sql`
            SELECT 
                id::text, 
                user_id::text, 
                title, 
                description, 
                type, 
                city, 
                neighborhood, 
                address, 
                price::text, 
                area_sqm::text, 
                bedrooms, 
                bathrooms, 
                parking_spots, 
                standard, 
                target_audience, 
                status, 
                photos, 
                minha_casa_minha_vida, 
                allows_financing, 
                down_payment::text, 
                condo_fee::text, 
                is_condo
            FROM properties 
            WHERE id = ${id}::uuid AND user_id = ${user.id}::uuid
            LIMIT 1
        `);

        if (result.length === 0) return null;

        const row = result[0] as any;

        // Limpeza absoluta de tipos para garantir serialização do Server Component
        return {
            id: String(row.id),
            userId: String(row.user_id),
            title: String(row.title || ''),
            description: row.description ? String(row.description) : null,
            type: String(row.type || ''),
            city: String(row.city || ''),
            neighborhood: row.neighborhood ? String(row.neighborhood) : null,
            address: row.address ? String(row.address) : null,
            price: row.price ? String(row.price) : null,
            areaSqm: row.area_sqm ? String(row.area_sqm) : null,
            bedrooms: row.bedrooms !== null ? Number(row.bedrooms) : null,
            bathrooms: row.bathrooms !== null ? Number(row.bathrooms) : null,
            parkingSpots: row.parking_spots !== null ? Number(row.parking_spots) : null,
            standard: row.standard ? String(row.standard) : 'medio',
            targetAudience: Array.isArray(row.target_audience) ? row.target_audience : [],
            status: String(row.status || ''),
            photos: Array.isArray(row.photos) ? row.photos : [],
            minhaCasaMinhaVida: Boolean(row.minha_casa_minha_vida),
            allowsFinancing: Boolean(row.allows_financing),
            downPayment: row.down_payment ? String(row.down_payment) : null,
            condoFee: row.condo_fee ? String(row.condo_fee) : null,
            isCondo: Boolean(row.is_condo),
        };
    } catch (error) {
        console.error("Critical Error fetching property by ID:", error);
        return null;
    }
}
