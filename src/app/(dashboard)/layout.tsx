import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css'; 
import Navbar from '@/components/shared/Navbar';
import { Providers } from '../providers';

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
          <Navbar />
          <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}