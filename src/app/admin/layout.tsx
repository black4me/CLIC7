import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-black text-white flex">
            <AdminSidebar />
            <main className="flex-1 lg:mr-72 p-4 lg:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
