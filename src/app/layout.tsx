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
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0d" },
  ],
};

const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistMono.variable, bricolage.variable, "font-sans", inter.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col sm:flex-row bg-page text-ink">
        <NavBar />
        <main className="min-w-0 flex-1 pb-24 sm:pb-0">{children}</main>
      </body>
    </html>
  );
}
