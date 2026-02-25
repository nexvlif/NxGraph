import type { Metadata } from 'next';
import './globals.css';
import AppLock from '@/components/AppLock';

export const metadata: Metadata = {
  title: 'NxGraph',
  description: 'Visual database diagram builder with drag & drop. Open source alternative to dbdiagram.io',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppLock>{children}</AppLock>
      </body>
    </html>
  );
}
