import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NxGraph',
  description: 'Visual database diagram builder with drag & drop. Open source alternative to dbdiagram.io',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
