import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/context";
import { ReactQueryProvider } from "@/lib/react-query/provider";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

export const metadata: Metadata = {
  title: "LittlePlus",
  description: "帮助小朋友进行简单的加减法练习，提升口算/心算能力",
  icons: {
    icon: "/images/plus.png",
    shortcut: "/images/plus.png",
    apple: "/images/plus.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body className="antialiased">
        <AuthProvider>
          <ReactQueryProvider>
            <div className="min-h-screen">
              {children}
            </div>
            <Toaster position="top-center" />
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 