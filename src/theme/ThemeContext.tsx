import { createContext, useContext, useState, type ReactNode } from "react";
import { Theme, applyTheme, loadTheme, saveTheme } from "./theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const next = loadTheme() ?? Theme.Light;
    applyTheme(next);
    return next;
  });

  function setTheme(next: Theme) {
    saveTheme(next);
    applyTheme(next);
    setThemeState(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return value;
}
