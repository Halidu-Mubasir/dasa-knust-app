import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementTicker } from "@/components/layout/AnnouncementTicker";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <AnnouncementTicker />
            <div className="flex-1">
                {children}
            </div>
            <Footer />
        </div>
    );
}
