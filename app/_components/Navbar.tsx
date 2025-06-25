// app/_components/Navbar.tsx

import Link from 'next/link';
import React from 'react'; // Keep this import, though often not strictly needed in newer React/Next.js
import { auth } from '@/auth'; // Assuming '@/auth' points to your auth.ts file exporting `auth` helper
import AuthButtons from './AuthButtons'; // Import your new Client Component

const Navbar = async () => {
    const session = await auth(); // Fetch session on the server

    return (
        <header className='px-5 py-3 bg-white shadow-sm font-work-sans'>
            <nav className='flex items-center justify-between'>
                <Link href="/">
                    MyApp   
                </Link>

                {/* Render the Client Component and pass the server-fetched session as a prop */}
                <AuthButtons session={session} />
            </nav>
        </header>
    )
}
export default Navbar;