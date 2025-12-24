import { Separator } from '@/components/ui/separator';
import { SidebarNav } from '@/components/settings/SidebarNav';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto px-4 py-10">
            <div className="mb-6">
                <PageHeader
                    title="Settings"
                    description="Manage your account settings and preferences"
                />
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="lg:w-1/5">
                    <SidebarNav />
                </aside>
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}
