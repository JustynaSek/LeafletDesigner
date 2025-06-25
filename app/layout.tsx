import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/lib/constants";
import AuthProvider from "@/app/_components/AuthProvider";
import { UserDisplay } from "@/app/components/UserDisplay";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100`}>
        <AuthProvider>
          <UserDisplay />
          <main className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
