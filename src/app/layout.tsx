import type { Metadata } from "next";
import { Permanent_Marker, Caveat, Archivo } from "next/font/google";
import "./globals.css";

const marker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "THE SYSTEM",
  description: "Shared health tracking board for Aaryan & Sakshi",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${marker.variable} ${caveat.variable} ${archivo.variable}`}>
      <body style={{ fontFamily: "var(--font-archivo), Helvetica, sans-serif" }}>{children}</body>
    </html>
  );
}
