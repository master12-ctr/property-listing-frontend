import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/shared/Navbar';
import { AuthInitializer } from '@/components/shared/AuthInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Property Listing Platform',
  description: 'Multi-tenant property listing platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthInitializer />
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}