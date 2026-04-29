import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AccessProvider from "./AccessProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KCF Group",
  description: "KCF Group — Fund & Community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full font-sans">
        <AccessProvider>{children}</AccessProvider>
      </body>
    </html>
  );
}
