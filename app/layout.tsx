import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavigationShell from "./_components/NavigationShell";
import { getChatGPTUser } from "./chatgpt-auth";
import "./globals.css";
import "./marketplace.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "\u79df\u8ff9 ZUJI \u00b7 \u771f\u5b9e\u79df\u5ba2\u7684\u8f6c\u79df\u5e73\u53f0",
  description: "\u6df1\u5733\u9996\u53d1\uff0c\u8ba9\u8f6c\u79df\u56de\u5230\u79df\u5ba2\u4e4b\u95f4\uff0c\u7528\u8bc1\u636e\u8bf4\u8bdd\u3002",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "\u79df\u8ff9 ZUJI \u00b7 \u79df\u623f\u53ef\u4ee5\u66f4\u8e0f\u5b9e\u4e00\u70b9",
    description: "\u771f\u5b9e\u79df\u5ba2\u3001\u79df\u7ea6\u6838\u9a8c\u3001\u7ad9\u5185\u6c9f\u901a\u3002",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "\u79df\u8ff9 ZUJI" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getChatGPTUser();
  const initialUser = user ? { displayName: user.displayName, email: user.email, authMethod: user.authMethod } : null;
  return <html lang="zh-CN"><body className={`${geistSans.variable} ${geistMono.variable} antialiased`}><NavigationShell initialUser={initialUser}>{children}</NavigationShell></body></html>;
}
