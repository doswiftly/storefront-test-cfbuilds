/**
 * Theme Configuration
 * Design tokens and theme settings for the storefront
 */

export const themeConfig = {
  // Default theme
  defaultTheme: "system" as const,

  // Available themes
  themes: ["light", "dark", "system"] as const,

  // Enable system theme detection
  enableSystem: true,

  // Disable theme transition on page load
  disableTransitionOnChange: false,

  // Storage key for theme preference
  storageKey: "doswiftly-theme",

  // Attribute to set on document element
  attribute: "class",

  // CSS variables for theme colors
  colors: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      "card-foreground": "222.2 84% 4.9%",
      popover: "0 0% 100%",
      "popover-foreground": "222.2 84% 4.9%",
      primary: "222.2 47.4% 11.2%",
      "primary-foreground": "210 40% 98%",
      secondary: "210 40% 96.1%",
      "secondary-foreground": "222.2 47.4% 11.2%",
      muted: "210 40% 96.1%",
      "muted-foreground": "215.4 16.3% 46.9%",
      accent: "210 40% 96.1%",
      "accent-foreground": "222.2 47.4% 11.2%",
      destructive: "0 84.2% 60.2%",
      "destructive-foreground": "210 40% 98%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "222.2 84% 4.9%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      "card-foreground": "210 40% 98%",
      popover: "222.2 84% 4.9%",
      "popover-foreground": "210 40% 98%",
      primary: "210 40% 98%",
      "primary-foreground": "222.2 47.4% 11.2%",
      secondary: "217.2 32.6% 17.5%",
      "secondary-foreground": "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      "muted-foreground": "215 20.2% 65.1%",
      accent: "217.2 32.6% 17.5%",
      "accent-foreground": "210 40% 98%",
      destructive: "0 62.8% 30.6%",
      "destructive-foreground": "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "212.7 26.8% 83.9%",
    },
  },
} as const;

export type Theme = (typeof themeConfig.themes)[number];

/**
 * Get theme colors for a specific theme
 */
export function getThemeColors(theme: "light" | "dark") {
  return themeConfig.colors[theme];
}

/**
 * Generate CSS variables for theme
 */
export function generateThemeVariables(theme: "light" | "dark") {
  const colors = getThemeColors(theme);
  return Object.entries(colors)
    .map(([key, value]) => `--${key}: ${value};`)
    .join("\n  ");
}
