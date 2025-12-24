import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            {/* 1. Main Container: Full screen, no scroll on body */}
            <div className="flex h-screen w-full overflow-hidden bg-slate-50">

                {/* 2. Sidebar: Static width, does NOT shrink */}
                <div className="w-64 flex-shrink-0 h-full">
                    <AdminSidebar />
                </div>

                {/* 3. Main Content: Takes remaining space, scrolls internally */}
                <main className="flex-1 h-full overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}
