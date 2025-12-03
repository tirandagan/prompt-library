import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import UserListsClient from './UserListsClient';
import { getUserLists } from '@/db/queries';

export default async function UserListsPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/');
    }

    const lists = await getUserLists(user.id);

    return (
        <UserListsClient initialLists={lists} userId={user.id} />
    );
}

