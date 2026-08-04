import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "\u79df\u8ff9 ZUJI \u00b7 \u771f\u5b9e\u79df\u5ba2\u7684\u8f6c\u79df\u5e73\u53f0",
  description: "\u6df1\u5733\u9996\u53d1\uff0c\u8ba9\u8f6c\u79df\u56de\u5230\u79df\u5ba2\u4e4b\u95f4\uff0c\u7528\u8bc1\u636e\u8bf4\u8bdd\u3002",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body></html>;
}
