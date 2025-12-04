// app/layout.tsx
import type { Metadata } from "next";
import { Lora, Urbanist } from "next/font/google"; // Importa as novas fontes
import { Playfair_Display } from "next/font/google";
import "./globals.css";

// Configura a fonte Lora (para títulos serifados)
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora", // Variável CSS para Lora
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

// Configura a fonte Urbanist (para o texto sans-serif)
const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist", // Variável CSS para Urbanist
});

export const metadata: Metadata = {
  title: "Aurora - Produtos de Beleza",
  description: "Descubra a coleção radiante",
};

import { AuthProvider } from "@/context/AuthContext";

// ... imports

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* Aplica as variáveis das fontes no body */}
      <body
        className={`${playfair.variable} ${lora.variable} ${urbanist.variable}`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
