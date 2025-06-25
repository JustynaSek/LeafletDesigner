// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
  // callbacks: {
  //   async session({ session, token }) {
  //     // Custom logic to add info to session if needed
  //     return session;
  //   },
  // },
});