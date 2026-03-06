"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { launches, launchUnits, users } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
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
        const validated = launchSchema.parse(data);

        // 1. Inserir o lançamento
        const [newLaunch] = await db.insert(launches).values({
            userId: user.id,
            name: validated.name,
            developer: validated.developer || null,
            description: validated.description || null,
            city: validated.city,
            neighborhood: validated.neighborhood || null,
            priceFrom: (validated.priceFrom && validated.priceFrom.trim() !== "")
                ? validated.priceFrom.replace(/[^\d.]/g, '')
                : null,
            deliveryDate: (validated.deliveryDate && validated.deliveryDate.trim() !== "")
                ? validated.deliveryDate
                : null,
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
                    areaSqm: (unit.areaSqm && unit.areaSqm.trim() !== "") ? unit.areaSqm : null,
                    bedrooms: unit.bedrooms,
                    bathrooms: unit.bathrooms,
                    parkingSpots: unit.parkingSpots,
                    price: (unit.price && unit.price.trim() !== "") ? unit.price.replace(/[^\d.]/g, '') : null,
                    photo: unit.photo || null,
                    minhaCasaMinhaVida: unit.minhaCasaMinhaVida,
                    allowsFinancing: unit.allowsFinancing,
                    downPayment: (unit.downPayment && unit.downPayment.trim() !== "") ? unit.downPayment.replace(/[^\d.]/g, '') : null,
                    condoFee: (unit.condoFee && unit.condoFee.trim() !== "") ? unit.condoFee.replace(/[^\d.]/g, '') : null,
                    isCondo: unit.isCondo,
                    targetAudience: unit.targetAudience || [],
                }))
            );
        }

        revalidatePath("/lancamentos");
        return { success: true };
    } catch (err: any) {
        console.error(err);
        return { error: err.message || "Erro ao salvar lançamento." };
    }
}

export async function deleteLaunch(id: string) {
    const user = await getOrCreateInternalUser();

    await db
        .delete(launches)
        .where(and(eq(launches.id, id), eq(launches.userId, user.id)));

    revalidatePath("/lancamentos");
    return { success: true };
}

export async function getLaunchById(id: string) {
    try {
        const user = await getOrCreateInternalUser();

        // 1. Buscar o lançamento com SQL robusto
        const launchResult = await db.execute(sql`
            SELECT 
                id::text, 
                user_id::text, 
                name, 
                developer, 
                description, 
                city, 
                neighborhood, 
                price_from::text, 
                delivery_date::text, 
                standard, 
                target_audience, 
                status, 
                photos
            FROM launches 
            WHERE id = ${id}::uuid AND user_id = ${user.id}::uuid
            LIMIT 1
        `);

        if (launchResult.length === 0) return null;
        const launchRow = launchResult[0] as any;

        // 2. Buscar as unidades vinculadas
        const unitsResult = await db.execute(sql`
            SELECT 
                id::text,
                launch_id::text,
                user_id::text,
                name,
                area_sqm::text,
                bedrooms,
                bathrooms,
                parking_spots,
                price::text,
                photo,
                minha_casa_minha_vida,
                allows_financing,
                down_payment::text,
                condo_fee::text,
                is_condo,
                target_audience
            FROM launch_units
            WHERE launch_id = ${id}::uuid
        `);

        // 3. Montar objeto final serializável
        return {
            id: String(launchRow.id),
            userId: String(launchRow.user_id),
            name: String(launchRow.name || ''),
            developer: launchRow.developer ? String(launchRow.developer) : null,
            description: launchRow.description ? String(launchRow.description) : null,
            city: String(launchRow.city || ''),
            neighborhood: launchRow.neighborhood ? String(launchRow.neighborhood) : null,
            priceFrom: launchRow.price_from ? String(launchRow.price_from) : null,
            deliveryDate: launchRow.delivery_date ? String(launchRow.delivery_date) : null,
            standard: String(launchRow.standard || 'medio'),
            targetAudience: Array.isArray(launchRow.target_audience) ? launchRow.target_audience : [],
            status: String(launchRow.status || 'launch'),
            photos: Array.isArray(launchRow.photos) ? launchRow.photos : [],
            units: unitsResult.map((u: any) => ({
                id: String(u.id),
                launchId: String(u.launch_id),
                userId: String(u.user_id),
                name: String(u.name || ''),
                areaSqm: u.area_sqm ? String(u.area_sqm) : null,
                bedrooms: u.bedrooms !== null ? Number(u.bedrooms) : null,
                bathrooms: u.bathrooms !== null ? Number(u.bathrooms) : null,
                parkingSpots: u.parking_spots !== null ? Number(u.parking_spots) : null,
                price: u.price ? String(u.price) : null,
                photo: u.photo ? String(u.photo) : null,
                minhaCasaMinhaVida: Boolean(u.minha_casa_minha_vida),
                allowsFinancing: Boolean(u.allows_financing),
                downPayment: u.down_payment ? String(u.down_payment) : null,
                condoFee: u.condo_fee ? String(u.condo_fee) : null,
                isCondo: Boolean(u.is_condo),
                targetAudience: Array.isArray(u.target_audience) ? u.target_audience : [],
            }))
        };
    } catch (error) {
        console.error("Critical Error fetching launch by ID:", error);
        return null;
    }
}
