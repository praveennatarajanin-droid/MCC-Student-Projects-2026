'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'Academic' | 'Corporate' | 'Startup' | 'Creative' | 'AI-Futuristic' | 'Apple-Minimal';
export type ModeType = 'light' | 'dark';

export interface CustomThemeConfig {
  primary?: string;
  secondary?: string;
  background?: string;
  cardBg?: string;
}

interface ThemeContextProps {
  theme: ThemeType;
  mode: ModeType;
  customConfig: CustomThemeConfig;
  setTheme: (theme: ThemeType) => void;
  setMode: (mode: ModeType) => void;
  setCustomConfig: (config: CustomThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const themeStyles: Record<ThemeType, {
  light: Record<string, string>;
  dark: Record<string, string>;
}> = {
  Academic: {
    light: {
      '--color-primary': '#800020',
      '--color-primary-hover': '#600018',
      '--color-secondary': '#C5A059',
      '--color-secondary-hover': '#a8833b',
      '--color-accent': '#f4ebd0',
      '--color-page-bg': '#fcfaf6',
      '--color-card-bg': 'rgba(255, 255, 255, 0.85)',
      '--color-card-border': 'rgba(197, 160, 89, 0.28)',
      '--color-text-main': '#2d251e',
      '--color-text-muted': '#6b5c50',
      '--shadow-glow': '0 8px 30px rgba(128, 0, 32, 0.08)',
    },
    dark: {
      '--color-primary': '#ff4b72',
      '--color-primary-hover': '#e02850',
      '--color-secondary': '#dcb873',
      '--color-secondary-hover': '#c49a50',
      '--color-accent': '#5c0a24',
      '--color-page-bg': '#120d0e',
      '--color-card-bg': 'rgba(30, 20, 22, 0.8)',
      '--color-card-border': 'rgba(220, 184, 115, 0.24)',
      '--color-text-main': '#f6f1eb',
      '--color-text-muted': '#c4b5a6',
      '--shadow-glow': '0 8px 30px rgba(255, 75, 114, 0.2)',
    }
  },
  Corporate: {
    light: {
      '--color-primary': '#0f172a',
      '--color-primary-hover': '#1e293b',
      '--color-secondary': '#3b82f6',
      '--color-secondary-hover': '#2563eb',
      '--color-accent': '#eff6ff',
      '--color-page-bg': '#f1f5f9',
      '--color-card-bg': 'rgba(255, 255, 255, 0.95)',
      '--color-card-border': 'rgba(15, 23, 42, 0.10)',
      '--color-text-main': '#0f172a',
      '--color-text-muted': '#475569',
      '--shadow-glow': '0 10px 30px rgba(59, 130, 246, 0.08)',
    },
    dark: {
      '--color-primary': '#3b82f6',
      '--color-primary-hover': '#60a5fa',
      '--color-secondary': '#64748b',
      '--color-secondary-hover': '#475569',
      '--color-accent': '#172554',
      '--color-page-bg': '#0a0f1e',
      '--color-card-bg': 'rgba(15, 23, 42, 0.85)',
      '--color-card-border': 'rgba(148, 163, 184, 0.12)',
      '--color-text-main': '#f8fafc',
      '--color-text-muted': '#94a3b8',
      '--shadow-glow': '0 10px 30px rgba(59, 130, 246, 0.2)',
    }
  },
  Startup: {
    light: {
      '--color-primary': '#7c3aed',
      '--color-primary-hover': '#6d28d9',
      '--color-secondary': '#06b6d4',
      '--color-secondary-hover': '#0891b2',
      '--color-accent': '#f5f3ff',
      '--color-page-bg': '#fafafa',
      '--color-card-bg': 'rgba(255, 255, 255, 0.7)',
      '--color-card-border': 'rgba(124, 58, 237, 0.16)',
      '--color-text-main': '#171717',
      '--color-text-muted': '#525252',
      '--shadow-glow': '0 8px 30px rgba(124, 58, 237, 0.12)',
    },
    dark: {
      '--color-primary': '#a78bfa',
      '--color-primary-hover': '#c084fc',
      '--color-secondary': '#22d3ee',
      '--color-secondary-hover': '#06b6d4',
      '--color-accent': '#2e1065',
      '--color-page-bg': '#090514',
      '--color-card-bg': 'rgba(18, 10, 36, 0.75)',
      '--color-card-border': 'rgba(167, 139, 250, 0.22)',
      '--color-text-main': '#f5f5f5',
      '--color-text-muted': '#a3a3a3',
      '--shadow-glow': '0 8px 30px rgba(167, 139, 250, 0.22)',
    }
  },
  Creative: {
    light: {
      '--color-primary': '#ec4899',
      '--color-primary-hover': '#db2777',
      '--color-secondary': '#14b8a6',
      '--color-secondary-hover': '#0d9488',
      '--color-accent': '#fdf2f8',
      '--color-page-bg': '#fffafc',
      '--color-card-bg': 'rgba(255, 255, 255, 0.85)',
      '--color-card-border': 'rgba(236, 72, 153, 0.15)',
      '--color-text-main': '#3d0a21',
      '--color-text-muted': '#85516a',
      '--shadow-glow': '0 8px 30px rgba(236, 72, 153, 0.1)',
    },
    dark: {
      '--color-primary': '#f472b6',
      '--color-primary-hover': '#fb7185',
      '--color-secondary': '#2dd4bf',
      '--color-secondary-hover': '#14b8a6',
      '--color-accent': '#500724',
      '--color-page-bg': '#1c0c16',
      '--color-card-bg': 'rgba(44, 20, 36, 0.75)',
      '--color-card-border': 'rgba(244, 114, 182, 0.22)',
      '--color-text-main': '#fdf2f8',
      '--color-text-muted': '#dda1c0',
      '--shadow-glow': '0 8px 30px rgba(244, 114, 182, 0.22)',
    }
  },
  'AI-Futuristic': {
    light: {
      '--color-primary': '#059669',
      '--color-primary-hover': '#047857',
      '--color-secondary': '#0ea5e9',
      '--color-secondary-hover': '#0284c7',
      '--color-accent': '#ecfdf5',
      '--color-page-bg': '#f0fdf4',
      '--color-card-bg': 'rgba(255, 255, 255, 0.8)',
      '--color-card-border': 'rgba(5, 150, 105, 0.22)',
      '--color-text-main': '#062f22',
      '--color-text-muted': '#166534',
      '--shadow-glow': '0 8px 30px rgba(5, 150, 105, 0.1)',
    },
    dark: {
      '--color-primary': '#10b981',
      '--color-primary-hover': '#34d399',
      '--color-secondary': '#06b6d4',
      '--color-secondary-hover': '#0891b2',
      '--color-accent': '#022c22',
      '--color-page-bg': '#030712',
      '--color-card-bg': 'rgba(10, 17, 32, 0.7)',
      '--color-card-border': 'rgba(16, 185, 129, 0.32)',
      '--color-text-main': '#f3f4f6',
      '--color-text-muted': '#9ca3af',
      '--shadow-glow': '0 8px 30px rgba(16, 185, 129, 0.35)',
    }
  },
  'Apple-Minimal': {
    light: {
      '--color-primary': '#0066cc',
      '--color-primary-hover': '#004499',
      '--color-secondary': '#86868b',
      '--color-secondary-hover': '#6e6e73',
      '--color-accent': '#f5f5f7',
      '--color-page-bg': '#ffffff',
      '--color-card-bg': 'rgba(245, 245, 247, 0.65)',
      '--color-card-border': 'rgba(0, 0, 0, 0.08)',
      '--color-text-main': '#1d1d1f',
      '--color-text-muted': '#86868b',
      '--shadow-glow': '0 8px 30px rgba(0, 0, 0, 0.03)',
    },
    dark: {
      '--color-primary': '#2997ff',
      '--color-primary-hover': '#147ce5',
      '--color-secondary': '#86868b',
      '--color-secondary-hover': '#6e6e73',
      '--color-accent': '#1d1d1f',
      '--color-page-bg': '#000000',
      '--color-card-bg': 'rgba(22, 22, 23, 0.75)',
      '--color-card-border': 'rgba(255, 255, 255, 0.12)',
      '--color-text-main': '#f5f5f7',
      '--color-text-muted': '#86868b',
      '--shadow-glow': '0 8px 30px rgba(255, 255, 255, 0.02)',
    }
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('Corporate');
  const [mode, setModeState] = useState<ModeType>('light');
  const [customConfig, setCustomConfigState] = useState<CustomThemeConfig>({});

  useEffect(() => {
    const savedTheme = localStorage.getItem('mcc_portfolio_theme') as ThemeType;
    const savedMode = localStorage.getItem('mcc_portfolio_mode') as ModeType;
    const savedConfig = localStorage.getItem('mcc_portfolio_custom_config');

    // Guard against stale/removed themes (e.g. 'MCC-Official') saved in localStorage
    if (savedTheme && themeStyles[savedTheme]) {
      setThemeState(savedTheme);
    } else if (savedTheme) {
      // Stale theme — clear it and fall back to default
      localStorage.removeItem('mcc_portfolio_theme');
    }
    if (savedMode) setModeState(savedMode);
    if (savedConfig) {
      try {
        setCustomConfigState(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse custom theme config', e);
      }
    }
  }, []);

  useEffect(() => {
    // Safety guard: if theme was removed (e.g. 'MCC-Official'), fall back to Corporate
    const safeTheme = themeStyles[theme] ? theme : 'Corporate';
    const root = document.documentElement;
    const activeVariables = { ...themeStyles[safeTheme][mode] };

    if (customConfig.primary) activeVariables['--color-primary'] = customConfig.primary;
    if (customConfig.secondary) activeVariables['--color-secondary'] = customConfig.secondary;
    if (customConfig.background) activeVariables['--color-page-bg'] = customConfig.background;
    if (customConfig.cardBg) activeVariables['--color-card-bg'] = customConfig.cardBg;

    Object.entries(activeVariables).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mode, customConfig]);

  const setTheme = (t: ThemeType) => {
    // Reject any theme key that no longer exists
    if (!themeStyles[t]) return;
    setThemeState(t);
    localStorage.setItem('mcc_portfolio_theme', t);
  };

  const setMode = (m: ModeType) => {
    setModeState(m);
    localStorage.setItem('mcc_portfolio_mode', m);
  };

  const setCustomConfig = (cfg: CustomThemeConfig) => {
    setCustomConfigState(cfg);
    localStorage.setItem('mcc_portfolio_custom_config', JSON.stringify(cfg));
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, customConfig, setTheme, setMode, setCustomConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
