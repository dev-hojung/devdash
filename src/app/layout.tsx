import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevDash - 개발자 생산성 대시보드",
  description: "GitHub PR 현황, 커밋 히트맵, 코드리뷰 대기 목록을 한눈에",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
