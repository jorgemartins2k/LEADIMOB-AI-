"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { launches, launchUnits, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const launchSchema = z.object({
    name: z.string().min(3, "O nome do lançamento deve ter pelo menos 3 caracteres"),
    developer: z.string().optional(),
    description: z.string().optional(),
    city: z.string().min(2, "Informe a cidade"),
    neighborhood: z.string().optional(),
    priceFrom: z.string().optional(),
    deliveryDate: z.string().optional(),
    standard: z.enum(["economico", "medio", "alto"]),
    targetAudience: z.array(z.string()).default([]),
    status: z.enum(["pre_launch", "launch", "under_construction"]),
    photos: z.array(z.string()).default([]),
    units: z.array(z.object({
        name: z.string().min(1, "Nome da planta"),
        areaSqm: z.string().optional(),
        bedrooms: z.number().optional(),
        parkingSpots: z.number().optional(),
        price: z.string().optional(),
    })).default([]),
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

export async function getLaunches() {
    const user = await getInternalUser();
    return db.query.launches.findMany({
        where: and(eq(launches.userId, user.id)),
        orderBy: [desc(launches.createdAt)],
        with: {
            // units: true, // If relation is defined in schema.ts
        }
    });
}

export async function createLaunch(data: z.infer<typeof launchSchema>) {
    const user = await getInternalUser();

    const validated = launchSchema.parse(data);

    // 1. Inserir o lançamento
    const [newLaunch] = await db.insert(launches).values({
        userId: user.id,
        name: validated.name,
        developer: validated.developer,
        description: validated.description,
        city: validated.city,
        neighborhood: validated.neighborhood,
        priceFrom: validated.priceFrom,
        deliveryDate: validated.deliveryDate, // date string is fine forpg date
        standard: validated.standard,
        targetAudience: validated.targetAudience,
        status: validated.status,
        photos: validated.photos,
    }).returning();

    // 2. Inserir as unidades (plantas)
    if (validated.units.length > 0) {
        await db.insert(launchUnits).values(
            validated.units.map((unit) => ({
                launchId: newLaunch.id,
                userId: user.id,
                name: unit.name,
                areaSqm: unit.areaSqm,
                bedrooms: unit.bedrooms,
                parkingSpots: unit.parkingSpots,
                price: unit.price,
            }))
        );
    }

    revalidatePath("/lancamentos");
    return { success: true };
}

export async function deleteLaunch(id: string) {
    const user = await getInternalUser();

    await db
        .delete(launches)
        .where(and(eq(launches.id, id), eq(launches.userId, user.id)));

    revalidatePath("/lancamentos");
    return { success: true };
}
