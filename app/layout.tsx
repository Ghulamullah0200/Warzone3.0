import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "../components/ui/toaster";

export const metadata: Metadata = {
  title: "Warzone-Monster",
  description: "Web3 Demo Prototype - Cyberpunk Card Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
