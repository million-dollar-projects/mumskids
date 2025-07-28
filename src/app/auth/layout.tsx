import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/context";
import "../globals.css";

export const metadata: Metadata = {
  title: "认证 - 儿童数学练习",
  description: "用户认证页面",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <html lang="zh">
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