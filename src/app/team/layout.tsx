import { createSessionClient } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default async function TeamLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let user: { $id: string, email: string } | null = null;
    try {
        const { account } = await createSessionClient();
        const appwriteUser = await account.get();
        user = {
            $id: appwriteUser.$id,
            email: appwriteUser.email,
        };
    } catch (e) {
        redirect('/login');
    }

    return (
        <DashboardShell user={user}>
            {children}
        </DashboardShell>
    );
}
