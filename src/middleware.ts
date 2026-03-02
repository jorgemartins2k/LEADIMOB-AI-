import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
    // Public routes that don't require authentication
    publicRoutes: [
        "/sign-in",
        "/sign-up",
        "/api/*",
    ],
});

export const config = {
    matcher: [
        // Match all routes except Next.js internals and static files
        "/((?!_next).*)",
        "/",
    ],
};
