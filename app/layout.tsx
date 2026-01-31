import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { BootstrapInit } from "@/components/BootstrapInit";

export const metadata: Metadata = {
  title: "User Management",
  description: "User registration and authentication with admin panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <BootstrapInit />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
