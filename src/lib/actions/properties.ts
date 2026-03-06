"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { properties, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
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
        return await db.query.properties.findFirst({
            where: and(eq(properties.id, id), eq(properties.userId, user.id)),
        });
    } catch (error) {
        console.error("Error fetching property by ID:", error);
        return null;
    }
}
