import { Theme } from "../theme/theme";
import { useTheme } from "../theme/ThemeContext";
import { Button } from "./Button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === Theme.Dark;

  return (
    <Button
      variant="secondary"
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? Theme.Light : Theme.Dark)}
    >
      {isDark ? "Light" : "Dark"}
    </Button>
  );
}
