import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PM Toolkit — AI Spec Generator for Product Managers",
  description:
    "Turn a vague idea into a full product spec in 60 seconds. Generate user stories, acceptance criteria, and edge cases with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#0F172A]`}>
        {children}
      </body>
    </html>
  );
}
