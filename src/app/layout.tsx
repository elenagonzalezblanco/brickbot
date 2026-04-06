import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrickBot - Diseña tu construcción LEGO con IA',
  description:
    'Crea construcciones LEGO personalizadas con ayuda de inteligencia artificial. Describe tu idea, visualízala en 3D y obtén la lista de piezas.',
  keywords: ['LEGO', 'IA', 'diseño 3D', 'construcción', 'BrickBot', 'LDraw'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
