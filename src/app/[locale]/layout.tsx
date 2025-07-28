import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/context";
import "../globals.css";

export const metadata: Metadata = {
  title: "儿童数学练习",
  description: "帮助小朋友进行简单的加减法练习，提升口算/心算能力",
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
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
} 