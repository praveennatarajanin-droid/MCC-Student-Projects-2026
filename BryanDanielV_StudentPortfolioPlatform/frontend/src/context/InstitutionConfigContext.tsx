"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/utils/api";

export interface InstitutionConfig {
  institutionName: string;
  establishedYear: string;
  academicYear: string;
  vision: string;
  mission: string;
  primaryColor: string;
  secondaryColor: string;
  defaultTheme: string;
  enabledThemes: string[];
}

const DEFAULT_CONFIG: InstitutionConfig = {
  institutionName: "Madras Christian College",
  establishedYear: "1837",
  academicYear: "2025/2026",
  vision: "To provide education of the highest quality to all, especially the underprivileged.",
  mission: "To nurture excellence, academic competence and social responsibility.",
  primaryColor: "#722F37",
  secondaryColor: "#D4AF37",
  defaultTheme: "academic",
  enabledThemes: ["academic", "corporate", "futuristic", "startup", "creative"],
};

interface InstitutionConfigContextType {
  config: InstitutionConfig;
  loading: boolean;
}

const InstitutionConfigContext = createContext<InstitutionConfigContextType>({
  config: DEFAULT_CONFIG,
  loading: true,
});

/** Convert a hex color (#RRGGBB or #RGB) to an "H S% L%" CSS HSL tuple string. */
function hexToHslTuple(hex: string): string | null {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  if (full.length !== 6) return null;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / delta + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / delta + 2) / 6; break;
      case b: h = ((r - g) / delta + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Lighten an HSL tuple string by raising the L value by `amount` percentage points. */
function lightenHslTuple(tuple: string, amount: number): string {
  const [h, s, lStr] = tuple.split(" ");
  const l = parseFloat(lStr);
  return `${h} ${s} ${Math.min(100, Math.round(l + amount))}%`;
}

export function InstitutionConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<InstitutionConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const data = await api.get<InstitutionConfig>("/admin/config");
        if (data) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...data,
            enabledThemes: Array.isArray(data.enabledThemes) && data.enabledThemes.length > 0
              ? data.enabledThemes
              : DEFAULT_CONFIG.enabledThemes,
          });
        }
      } catch {
        // Silently fall back to defaults
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  // Inject brand colors into CSS variables used throughout the entire UI
  useEffect(() => {
    if (typeof document === "undefined") return;

    const primaryHsl = hexToHslTuple(config.primaryColor);
    const secondaryHsl = hexToHslTuple(config.secondaryColor);

    if (primaryHsl) {
      // --mcc-maroon drives: bg-mcc-maroon, text-mcc-maroon, border-mcc-maroon, ring etc.
      document.documentElement.style.setProperty("--mcc-maroon", primaryHsl);
      // --mcc-maroon-light is used for hover states
      document.documentElement.style.setProperty("--mcc-maroon-light", lightenHslTuple(primaryHsl, 12));
      // Keep --primary in sync too (used by Tailwind's bg-primary utilities)
      document.documentElement.style.setProperty("--primary", primaryHsl);
      document.documentElement.style.setProperty("--ring", primaryHsl);
    }

    if (secondaryHsl) {
      // --mcc-gold drives: text-mcc-gold, border-mcc-gold, bg-mcc-gold etc.
      document.documentElement.style.setProperty("--mcc-gold", secondaryHsl);
      document.documentElement.style.setProperty("--secondary", secondaryHsl);
    }
  }, [config.primaryColor, config.secondaryColor]);

  return (
    <InstitutionConfigContext.Provider value={{ config, loading }}>
      {children}
    </InstitutionConfigContext.Provider>
  );
}

export function useInstitutionConfig() {
  return useContext(InstitutionConfigContext);
}
