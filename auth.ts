// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/lib/db";

// eslint-disable-next-line no-console
console.log('[auth] Prisma instance in auth.ts:', typeof prisma);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      // Ensure these environment variables are correctly set in your .env.local
      // For GoogleProvider, you must provide clientId and clientSecret
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  // Optional: Add other configurations here if needed
  // like pages, callbacks, session, etc.
  // pages: {
  //   signIn: '/auth/signin',
  // },
  callbacks: {
    async session({ session, user }) {
      // Add user ID to the session
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});