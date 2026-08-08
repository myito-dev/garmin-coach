import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist_Mono, Inter } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Garmin Coach by Mario Galindo",
  description:
    "Panel de entrenamiento conectado a Garmin Connect para el Medio Maratón de Puebla: plan de 13 semanas, comparación de sesiones y análisis de cada entrenamiento.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={cn("h-full", "antialiased", geistMono.variable, bricolage.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col sm:flex-row bg-page text-ink">
        <NavBar />
        <main className="min-w-0 flex-1 pb-[calc(env(safe-area-inset-bottom)+112px)] sm:pb-0">{children}</main>
      </body>
    </html>
  );
}
