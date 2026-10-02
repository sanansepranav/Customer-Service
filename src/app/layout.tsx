import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dm = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prince Tailor and Designer Studio",
  description:
    "Bespoke tailoring, customer measurements, orders, fabric stock, and billing for Prince Tailor and Designer Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dm.variable} ${playfair.variable} antialiased`}>{children}</body>
    </html>
  );
}
