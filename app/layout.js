import './globals.css';
import { Providers } from './providers';
import { Inter } from 'next/font/google';
import ShaderBackground from '@/components/ShaderBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SITE TESTE MEDICI',
  description: 'SITE TESTE',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body className={`${inter.className} antialiased`}>
        <ShaderBackground />
        <Providers>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}