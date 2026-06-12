import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCC Portfolio Platform – Madras Christian College AI-Powered Student Ecosystem",
  description:
    "The official AI-Powered Student Portfolio Ecosystem of Madras Christian College. Showcase academic achievements, research, projects, certifications, and career readiness.",
  keywords: [
    "Madras Christian College",
    "MCC",
    "Student Portfolio",
    "AI Portfolio",
    "Academic Showcase",
    "Research",
    "NAAC",
    "NIRF",
    "Student Ecosystem",
  ],
  openGraph: {
    title: "MCC Portfolio Platform",
    description:
      "AI-Powered Student Portfolio Ecosystem for Madras Christian College students.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: `
          try {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          } catch (_) {}
        `}} />
      </head>
      <body
        className="antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen font-sans"
      >
        {children}
      </body>
    </html>
  );
}
