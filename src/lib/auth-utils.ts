import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Gets the internal database user, creating it from Clerk data if it doesn't exist.
 * This acts as a fallback for when webhooks fail or haven't run yet.
 */
export async function getOrCreateInternalUser() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Não autorizado");

    let user = await db.query.users.findFirst({
        where: eq(users.clerkUserId, clerkUserId),
    });

    if (!user) {
        // Fetch full user details from Clerk
        const clerkUser = await currentUser();
        if (!clerkUser) throw new Error("Clerk user not found");

        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email?.split('@')[0] || "Usuário";

        // Create the user in our DB
        const [newUser] = await db.insert(users).values({
            clerkUserId,
            name,
            email: email || "",
            avatarUrl: clerkUser.imageUrl,
            updatedAt: new Date(),
        }).returning();

        user = newUser;
    }

    return user;
}
