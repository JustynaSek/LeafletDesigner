'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export const LoginButton = ({ isPrimary = true }: { isPrimary?: boolean }) => {
  const handleSignIn = () => {
    signIn('google');
  };

  if (isPrimary) {
    return (
        <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Welcome!</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">Please sign in to begin generating your leaflet.</p>
            <Button
                onClick={handleSignIn}
                className="px-6 py-3"
            >
                Sign in with Google
            </Button>
        </div>
    );
  }

  return (
     <Button
        onClick={handleSignIn}
        variant="outline"
        className="w-full"
      >
        Sign in with Google
      </Button>
  )
}; 