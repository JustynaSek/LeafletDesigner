// app/_components/AuthButtons.tsx
'use client'; // Required for onClick and useSession

import { signIn, signOut } from 'next-auth/react'; // Correct import for client-side signIn/signOut
import Link from 'next/link';
import { Session } from 'next-auth'; // Import Session type for better typing

interface AuthButtonsProps {
  session: Session | null; // Pass the session down from the Navbar (Server Component)
}

export default function AuthButtons({ session }: AuthButtonsProps) {
  return (
    <div className='flex items-center gap-5'>
      {session && session?.user ? (
        <>
          <Link href="/startup/create"><span>Create</span></Link>
          <button
            // Correct syntax: wrap in an arrow function to delay execution until click
            onClick={() => signOut()}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <span>Logout</span>
          </button>
          {/* Corrected: session.user?.id or session.user?.name */}
          <Link href={`/user/${session.user?.id || session.user?.email}`}>
            <span>{session.user?.name || session.user?.email}</span>
          </Link>
        </>
      ) : (
        <button
          // Correct syntax: wrap in arrow function, pass provider string or object
          onClick={() => signIn('google')} // Pass the provider name as a string
          // OR: onClick={() => signIn('google', { callbackUrl: '/' })} for a specific redirect after login
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <span>Login</span>
        </button>
      )}
    </div>
  );
}