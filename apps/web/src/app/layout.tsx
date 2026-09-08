import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '../components/providers/ClientProviders';

export const metadata: Metadata = {
  title: 'KrishiSetu — Market Intelligence for Farmers',
  description:
    'Market-decision and transaction-intelligence platform that helps farmers determine the best practical selling opportunity.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#ededed] text-neutral-900 font-inter antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
