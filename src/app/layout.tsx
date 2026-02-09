import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SetLog - 바이브 코딩을 위한 서비스 연결 & API 관리 플랫폼",
  description:
    "서비스 연결, API 키 관리, 환경변수 설정까지. 복잡한 프로젝트 초기 설정을 체계적으로 관리하세요.",
  keywords: [
    "바이브 코딩",
    "vibe coding",
    "API 관리",
    "환경변수",
    "서비스 연결",
    "프로젝트 설정",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
