import type { Metadata, Viewport } from 'next';
import { MainLayout } from '@/components/main-layout';
import { Toaster } from "@/components/ui/toaster"
import { Providers } from '@/components/providers';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import { ColorThemeProvider } from '@/components/color-theme-provider';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'ClassSync',
  description: 'Manage your school schedule, find study groups, and summarize notes with AI.',
  applicationName: 'ClassSync',
  appleWebApp: {
    capable: true,
    title: 'ClassSync',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: '/web-app-manifest-512x512.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            <ColorThemeProvider>
              <Providers>
                <MainLayout>{children}</MainLayout>
                <Toaster />
              </Providers>
            </ColorThemeProvider>
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}