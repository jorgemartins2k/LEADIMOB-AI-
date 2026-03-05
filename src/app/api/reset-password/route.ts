import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
        }

        const client = await clerkClient();

        // Find the user by email
        const usersResult = await client.users.getUserList({ emailAddress: [email] });

        if (!usersResult.data || usersResult.data.length === 0) {
            // Don't reveal whether the email exists — security best practice
            return NextResponse.json({ success: true });
        }

        const user = usersResult.data[0];

        // Use Clerk Backend API to trigger a password reset email
        // This sends a "forgot password" email via the Clerk Backend REST API
        await fetch(`https://api.clerk.com/v1/users/${user.id}/send_verification_email`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Password reset error:", e);
        return NextResponse.json(
            { error: e.message || "Erro ao processar solicitação." },
            { status: 500 }
        );
    }
}
