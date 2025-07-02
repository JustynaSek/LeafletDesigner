'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const LoginButton = ({ isPrimary = true }: { isPrimary?: boolean }) => {

  if (isPrimary) {
    return (
        <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Welcome!</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">Please sign in to begin generating your leaflet.</p>
            <Button asChild className="px-6 py-3">
                <Link href="/api/auth/signin">Sign in with Google</Link>
            </Button>
        </div>
    );
  }

  return (
     <Button asChild variant="outline" className="w-full">
        <Link href="/api/auth/signin">Sign in with Google</Link>
      </Button>
  )
}; 