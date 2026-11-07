import type { Metadata } from "next";
import { Advent_Pro } from "next/font/google";
import "./globals.css";

const adventPro = Advent_Pro({
  variable: "--font-advent-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "emotMusic",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${adventPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
