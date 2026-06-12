import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { InstitutionConfigProvider } from "@/context/InstitutionConfigContext";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#050a18" },
  ],
};

export const metadata: Metadata = {
  title: "MCC AI-Powered Student Portfolio Ecosystem",
  description:
    "The centralized digital identity and achievement showcase platform for Madras Christian College students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${playfair.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          <InstitutionConfigProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </InstitutionConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
