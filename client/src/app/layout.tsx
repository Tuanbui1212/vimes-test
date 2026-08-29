import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIMES - Hệ Thống Quản Lý Kho Dược & Vật Tư Y Tế",
  description: "Hệ thống quản lý kho tổng thể và nhập xuất vật tư y tế VIMES",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50" suppressHydrationWarning>
        <MainLayout>{children}</MainLayout>
        <Toaster position="top-right" richColors closeButton expand={false} />
      </body>
    </html>
  );
}
