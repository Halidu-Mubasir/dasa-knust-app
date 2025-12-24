'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function AdminHeader() {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background px-4 sm:px-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/admin-dashboard">Admin</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {paths.slice(1).map((path, index) => {
                        const isLast = index === paths.slice(1).length - 1;
                        const href = `/${paths.slice(0, index + 2).join('/')}`;
                        const label = path.charAt(0).toUpperCase() + path.slice(1);

                        return (
                            <div key={path} className="flex items-center">
                                <BreadcrumbSeparator />
                                <BreadcrumbItem className="ml-2">
                                    {isLast ? (
                                        <BreadcrumbPage>{label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={href}>{label}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </div>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </header>
    );
}
