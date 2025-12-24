export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div className="relative">{children}</div>
        </div>
    );
}
