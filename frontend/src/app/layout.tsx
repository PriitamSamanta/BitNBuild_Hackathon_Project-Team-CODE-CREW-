import type { Metadata } from 'next';
import '../src/index.css';
import { Providers } from '@/src/providers/Providers';

export const metadata: Metadata = {
  title: 'RES-Q Emergency Command Center',
  description: 'Emergency response command center frontend',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
