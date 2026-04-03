import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Rotas verdadeiramente públicas — sem autenticação
const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    // Webhooks externos precisam ser públicos (verificam assinatura própria)
    '/api/webhooks/clerk',
    '/api/webhooks/zapi',
    // Cron de automação — verificado por CRON_SECRET internamente
    '/api/automation/run',
    // Rastreamento de campanhas
    '/c/(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
