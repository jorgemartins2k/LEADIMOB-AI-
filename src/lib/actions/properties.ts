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
    parkingSpots: z.number().optional(),
    standard: z.enum(["economico", "medio", "alto"]),
    targetAudience: z.array(z.string()).default([]),
    photos: z.array(z.string()).default([]),
});

async function getInternalUser() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Não autorizado");

    const user = await db.query.users.findFirst({
        where: eq(users.clerkUserId, clerkUserId),
    });

    if (!user) throw new Error("Usuário não encontrado");
    return user;
}

export async function getProperties() {
    const user = await getInternalUser();
    return db.query.properties.findMany({
        where: and(eq(properties.userId, user.id)),
        orderBy: [desc(properties.createdAt)],
    });
}

export async function createProperty(data: z.infer<typeof propertySchema>) {
    const user = await getInternalUser();

    const validated = propertySchema.parse(data);

    await db.insert(properties).values({
        userId: user.id,
        ...validated,
        price: validated.price, // Drizzle handles numeric
        areaSqm: validated.areaSqm,
    });

    revalidatePath("/imoveis");
    return { success: true };
}

export async function deleteProperty(id: string) {
    const user = await getInternalUser();

    await db
        .delete(properties)
        .where(and(eq(properties.id, id), eq(properties.userId, user.id)));

    revalidatePath("/imoveis");
    return { success: true };
}
