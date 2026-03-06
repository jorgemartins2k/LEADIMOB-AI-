import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col md:flex-row h-screen bg-bg overflow-hidden font-body text-text">
            {/* Mobile Header */}
            <MobileHeader />

            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex h-full flex-col">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-surface/50 p-4 sm:p-6 md:p-8">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
