import { Sidebar } from "@/components/sidebar";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-bg overflow-hidden font-body text-text">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex h-full flex-col">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-surface/50 p-6 md:p-8">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
