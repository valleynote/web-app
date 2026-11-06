import type { Metadata } from "next";
import { Inter, Inter_Tight, DM_Mono, Caveat } from "next/font/google";
import AppToaster from "@/components/app/AppToaster";
import CookieBanner from "@/components/CookieBanner";
import NavigationProgress from "@/components/NavigationProgress";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ValleyNote — AI-powered notebook",
  description:
    "ValleyNote by Moonlight Valley LLC is an AI-powered notebook for students, freelancers, and founders—write, organize, and ask your notes anything.",
  icons: {
    icon: [{ url: "/favicon-white.svg", type: "image/svg+xml" }],
    shortcut: "/favicon-white.svg",
    apple: "/favicon-white.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${dmMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg font-sans text-ink">
        <NavigationProgress />
        {children}
        <CookieBanner />
        <AppToaster />
      </body>
    </html>
  );
}
