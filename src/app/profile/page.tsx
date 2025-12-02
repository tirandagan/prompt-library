import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function ProfilePage() {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
        redirect('/');
    }

    // Fetch fresh user data including bio
    const [user] = await db.select().from(users).where(eq(users.id, sessionUser.id));

    if (!user) {
        redirect('/');
    }

    return (
        <div className="container mx-auto py-8">
            <ProfileClient user={user} />
        </div>
    );
}

