"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { launches, launchUnits, users, campaigns, appointments } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const launchSchema = z.object({
    name: z.string().min(3, "O nome do lançamento deve ter pelo menos 3 caracteres"),
    developer: z.string().optional(),
    description: z.string().optional(),
    websiteUrl: z.string().url("URL inválida").optional().or(z.literal("")),
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
        bathrooms: z.number().optional(),
        parkingSpots: z.number().optional(),
        price: z.string().optional(),
        photo: z.string().optional(),
        minhaCasaMinhaVida: z.boolean().default(false),
        allowsFinancing: z.boolean().default(false),
        downPayment: z.string().optional(),
        condoFee: z.string().optional(),
        isCondo: z.boolean().default(false),
        targetAudience: z.array(z.string()).default([]),
    })).default([]),
});

import { getOrCreateInternalUser } from "@/lib/auth-utils";

export async function getLaunches() {
    const user = await getOrCreateInternalUser();
    return db.query.launches.findMany({
        where: and(eq(launches.userId, user.id)),
        orderBy: [desc(launches.createdAt)],
        with: {
            // units: true, // If relation is defined in schema.ts
        }
    });
}

export async function createLaunch(data: z.infer<typeof launchSchema>) {
    try {
        const user = await getOrCreateInternalUser();

        // 1. Validar os dados
        const result = launchSchema.safeParse(data);
        if (!result.success) {
            const firstError = result.error.issues[0];
            return { error: `${firstError.path.join('.')}: ${firstError.message}` };
        }
        const validated = result.data;

        // 2. Inserir o lançamento
        const [newLaunch] = await db.insert(launches).values({
            userId: user.id,
            name: validated.name,
            developer: validated.developer || null,
            description: validated.description || null,
            websiteUrl: validated.websiteUrl || null,
            city: validated.city,
            neighborhood: validated.neighborhood || null,
            priceFrom: (validated.priceFrom && String(validated.priceFrom).trim() !== "")
                ? String(validated.priceFrom).replace(/[^\d.]/g, '')
                : null,
            deliveryDate: (validated.deliveryDate && String(validated.deliveryDate).trim() !== "")
                ? validated.deliveryDate
                : null,
            standard: validated.standard,
            targetAudience: Array.isArray(validated.targetAudience) ? validated.targetAudience : [],
            status: validated.status,
            photos: Array.isArray(validated.photos) ? validated.photos : [],
        }).returning();

        // 3. Inserir as unidades (plantas)
        if (validated.units && validated.units.length > 0) {
            await db.insert(launchUnits).values(
                validated.units.map((unit) => ({
                    launchId: newLaunch.id,
                    userId: user.id,
                    name: unit.name,
                    areaSqm: (unit.areaSqm && String(unit.areaSqm).trim() !== "") ? String(unit.areaSqm).replace(/[^\d.]/g, '') : null,
                    bedrooms: Math.max(0, unit.bedrooms || 0),
                    bathrooms: Math.max(0, unit.bathrooms || 0),
                    parkingSpots: Math.max(0, unit.parkingSpots || 0),
                    price: (unit.price && String(unit.price).trim() !== "") ? String(unit.price).replace(/[^\d.]/g, '') : null,
                    photo: unit.photo || null,
                    minhaCasaMinhaVida: !!unit.minhaCasaMinhaVida,
                    allowsFinancing: !!unit.allowsFinancing,
                    downPayment: (unit.downPayment && String(unit.downPayment).trim() !== "") ? String(unit.downPayment).replace(/[^\d.]/g, '') : null,
                    condoFee: (unit.condoFee && String(unit.condoFee).trim() !== "") ? String(unit.condoFee).replace(/[^\d.]/g, '') : null,
                    isCondo: !!unit.isCondo,
                    targetAudience: Array.isArray(unit.targetAudience) ? unit.targetAudience : [],
                }))
            );
        }

        revalidatePath("/lancamentos");
        return { success: true };
    } catch (err: any) {
        console.error("Error creating launch:", err);
        return { error: err.message || "Erro ao salvar lançamento no banco de dados." };
    }
}

export async function updateLaunch(id: string, data: z.infer<typeof launchSchema>) {
    try {
        const user = await getOrCreateInternalUser();
        const validated = launchSchema.parse(data);

        await db.update(launches).set({
            name: validated.name,
            developer: validated.developer || null,
            description: validated.description || null,
            websiteUrl: validated.websiteUrl || null,
            city: validated.city,
            neighborhood: validated.neighborhood || null,
            priceFrom: (validated.priceFrom && String(validated.priceFrom).trim() !== "")
                ? String(validated.priceFrom).replace(/[^\d.]/g, '')
                : null,
            deliveryDate: (validated.deliveryDate && String(validated.deliveryDate).trim() !== "")
                ? validated.deliveryDate
                : null,
            standard: validated.standard,
            targetAudience: Array.isArray(validated.targetAudience) ? validated.targetAudience : [],
            status: validated.status,
            photos: Array.isArray(validated.photos) ? validated.photos : [],
            updatedAt: new Date(),
        }).where(and(eq(launches.id, id), eq(launches.userId, user.id)));

        await db.delete(launchUnits)
            .where(and(eq(launchUnits.launchId, id), eq(launchUnits.userId, user.id)));

        if (validated.units && validated.units.length > 0) {
            await db.insert(launchUnits).values(
                validated.units.map((unit) => ({
                    launchId: id,
                    userId: user.id,
                    name: unit.name,
                    areaSqm: (unit.areaSqm && String(unit.areaSqm).trim() !== "") ? String(unit.areaSqm).replace(/[^\d.]/g, '') : null,
                    bedrooms: Math.max(0, unit.bedrooms || 0),
                    bathrooms: Math.max(0, unit.bathrooms || 0),
                    parkingSpots: Math.max(0, unit.parkingSpots || 0),
                    price: (unit.price && String(unit.price).trim() !== "") ? String(unit.price).replace(/[^\d.]/g, '') : null,
                    photo: unit.photo || null,
                    minhaCasaMinhaVida: !!unit.minhaCasaMinhaVida,
                    allowsFinancing: !!unit.allowsFinancing,
                    downPayment: (unit.downPayment && String(unit.downPayment).trim() !== "") ? String(unit.downPayment).replace(/[^\d.]/g, '') : null,
                    condoFee: (unit.condoFee && String(unit.condoFee).trim() !== "") ? String(unit.condoFee).replace(/[^\d.]/g, '') : null,
                    isCondo: !!unit.isCondo,
                    targetAudience: Array.isArray(unit.targetAudience) ? unit.targetAudience : [],
                }))
            );
        }

        revalidatePath("/lancamentos");
        revalidatePath(`/lancamentos/${id}`);
        return { success: true };
    } catch (err: any) {
        console.error("Error updating launch:", err);
        return { error: err.message || "Erro ao atualizar lançamento." };
    }
}

export async function deleteLaunch(id: string) {
    try {
        const user = await getOrCreateInternalUser();

        // 1. Verify ownership
        const launch = await db.query.launches.findFirst({
            where: and(eq(launches.id, id), eq(launches.userId, user.id))
        });

        if (!launch) {
            return { error: "Lançamento não encontrado ou você não tem permissão para excluí-lo." };
        }

        // 2. Remove references from related tables to prevent foreign key constraint errors
        await db.update(campaigns).set({ launchId: null }).where(eq(campaigns.launchId, id));
        await db.update(appointments).set({ launchId: null }).where(eq(appointments.launchId, id));

        // 3. Delete all dependent launch units
        await db.delete(launchUnits).where(eq(launchUnits.launchId, id));

        // 4. Finally, delete the primary launch record
        await db.delete(launches).where(eq(launches.id, id));

        revalidatePath("/lancamentos");
        return { success: true };
    } catch (err: any) {
        console.error("Error deleting launch:", err);
        return { error: err.message || "Erro interno ao excluir lançamento." };
    }
}

export async function getLaunchById(id: string) {
    try {
        const user = await getOrCreateInternalUser();

        const launch = await db.query.launches.findFirst({
            where: and(eq(launches.id, id), eq(launches.userId, user.id)),
            with: {
                units: true
            }
        });

        if (!launch) return null;

        // Garantir que os dados sejam serializáveis para Client Components
        return {
            ...launch,
            id: String(launch.id),
            userId: String(launch.userId),
            websiteUrl: launch.websiteUrl ? String(launch.websiteUrl) : null,
            priceFrom: launch.priceFrom ? String(launch.priceFrom) : null,
            deliveryDate: launch.deliveryDate ? String(launch.deliveryDate) : null,
            targetAudience: Array.isArray(launch.targetAudience) ? launch.targetAudience : [],
            photos: Array.isArray(launch.photos) ? launch.photos : [],
            units: launch.units.map((u) => ({
                ...u,
                id: String(u.id),
                launchId: String(u.launchId),
                userId: String(u.userId),
                areaSqm: u.areaSqm ? String(u.areaSqm) : null,
                price: u.price ? String(u.price) : null,
                downPayment: u.downPayment ? String(u.downPayment) : null,
                condoFee: u.condoFee ? String(u.condoFee) : null,
                targetAudience: Array.isArray(u.targetAudience) ? u.targetAudience : [],
            }))
        };
    } catch (error) {
        console.error("Critical Error fetching launch by ID:", error);
        return null;
    }
}
