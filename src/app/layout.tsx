import type { Metadata } from 'next';
import { MainLayout } from '@/components/main-layout';
import { Toaster } from "@/components/ui/toaster"
import { Providers } from '@/components/providers';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClassSync',
  description: 'Manage your school schedule, find study groups, and summarize notes with AI.',
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
            disableTransitionOnChange
          >
            <Providers>
              <MainLayout>{children}</MainLayout>
              <Toaster />
            </Providers>
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
