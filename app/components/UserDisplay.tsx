'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const UserDisplay = () => {
    const { data: session } = useSession();

    if (!session) {
        return null;
    }

    return (
        <div className="absolute top-4 right-4 flex items-center gap-4 bg-gray-800 p-2 rounded-lg shadow-lg">
            <p className="text-sm text-gray-300 hidden sm:block">{session.user?.email}</p>
            <Button asChild variant="destructive" size="sm">
                <Link href="/api/auth/signout">Sign Out</Link>
            </Button>
        </div>
    );
}; 