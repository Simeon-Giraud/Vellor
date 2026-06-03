"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: "dark", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to dark — matches old hardcoded `theme-dark` dashboard behavior.
  // On mount we'll immediately overwrite from localStorage, so there's no real flash.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // Eagerly read the stored preference (runs synchronously before first paint)
    const stored = localStorage.getItem("vellor-theme") as Theme | null;
    const resolved: Theme =
      stored === "dark" || stored === "light" ? stored : "dark";

    // Persist the resolved value so future loads are instant
    if (!stored) localStorage.setItem("vellor-theme", "dark");

    setThemeState(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("vellor-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  // Always render children — no blank-flash from returning null.
  // The CSS custom properties update instantly when data-theme is set on <html>.
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
