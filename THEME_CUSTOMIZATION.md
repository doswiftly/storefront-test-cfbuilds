# Theme Customization Guide

This guide explains how to customize the theme colors and appearance of your storefront.

## Overview

The storefront uses a theme system based on CSS variables and Tailwind CSS v4. The theme supports:
- Light mode
- Dark mode
- System preference detection
- Smooth transitions between themes
- Persistent theme selection (localStorage)

## Theme Configuration

The main theme configuration is located in `lib/theme/theme-config.ts`:

```typescript
export const themeConfig = {
  defaultTheme: "system",
  themes: ["light", "dark", "system"],
  enableSystem: true,
  disableTransitionOnChange: false,
  storageKey: "doswiftly-theme",
  attribute: "class",
  colors: {
    light: { /* ... */ },
    dark: { /* ... */ }
  }
}
```

## Customizing Colors

### Method 1: Update CSS Variables (Recommended)

Edit `app/globals.css` to change theme colors:

```css
@theme {
  /* Light mode colors */
  --color-primary: rgb(59 130 246); /* Change this */
  --color-primary-foreground: rgb(255 255 255);
  /* ... other colors */
}

.dark {
  /* Dark mode colors */
  --color-primary: rgb(96 165 250); /* Change this */
  --color-primary-foreground: rgb(15 23 42);
  /* ... other colors */
}
```

### Method 2: Update Theme Config

Edit `lib/theme/theme-config.ts`:

```typescript
export const themeConfig = {
  // ...
  colors: {
    light: {
      primary: "220 90% 56%", // HSL format
      // ...
    },
    dark: {
      primary: "220 90% 70%",
      // ...
    }
  }
}
```

## Available Color Variables

The following CSS variables are available for customization:

### Core Colors
- `--color-background` - Main background color
- `--color-foreground` - Main text color
- `--color-primary` - Primary brand color
- `--color-primary-foreground` - Text on primary color
- `--color-secondary` - Secondary brand color
- `--color-secondary-foreground` - Text on secondary color

### UI Colors
- `--color-muted` - Muted background (for disabled states, etc.)
- `--color-muted-foreground` - Muted text color
- `--color-accent` - Accent color (for highlights)
- `--color-accent-foreground` - Text on accent color
- `--color-border` - Border color
- `--color-ring` - Focus ring color

### Component Colors
- `--color-card` - Card background
- `--color-card-foreground` - Card text
- `--color-destructive` - Error/danger color
- `--color-destructive-foreground` - Text on destructive color

## Brand Color Examples

### Blue Theme (Default)
```css
--color-primary: rgb(59 130 246); /* blue-500 */
```

### Green Theme
```css
--color-primary: rgb(34 197 94); /* green-500 */
--color-accent: rgb(74 222 128); /* green-400 */
```

### Purple Theme
```css
--color-primary: rgb(168 85 247); /* purple-500 */
--color-accent: rgb(192 132 252); /* purple-400 */
```

### Orange Theme
```css
--color-primary: rgb(249 115 22); /* orange-500 */
--color-accent: rgb(251 146 60); /* orange-400 */
```

## Theme Switcher Components

Three theme switcher variants are available:

### 1. Simple Toggle (Default)
```tsx
import { ThemeSwitcher } from "@/components/layout/theme-switcher";

<ThemeSwitcher />
```

### 2. Dropdown Menu
```tsx
import { ThemeSwitcherDropdown } from "@/components/layout/theme-switcher";

<ThemeSwitcherDropdown />
```

### 3. Compact Buttons
```tsx
import { ThemeSwitcherCompact } from "@/components/layout/theme-switcher";

<ThemeSwitcherCompact showLabel />
```

## Programmatic Theme Control

Use the `useTheme` hook from `next-themes`:

```tsx
"use client";

import { useTheme } from "next-themes";

export function MyComponent() {
  const { theme, setTheme, systemTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme("dark")}>
      Switch to Dark Mode
    </button>
  );
}
```

## Disable Theme Transitions

To disable transitions when theme changes (prevents flash):

```typescript
// lib/theme/theme-config.ts
export const themeConfig = {
  // ...
  disableTransitionOnChange: true, // Set to true
}
```

## Custom Theme Storage

To use a different storage key:

```typescript
// lib/theme/theme-config.ts
export const themeConfig = {
  // ...
  storageKey: "my-custom-theme-key",
}
```

## Force a Specific Theme

To force light or dark mode without system detection:

```typescript
// lib/theme/theme-config.ts
export const themeConfig = {
  defaultTheme: "light", // or "dark"
  enableSystem: false, // Disable system detection
}
```

## Testing Themes

1. **Manual Testing**: Use the theme switcher in the header
2. **Browser DevTools**: Toggle dark mode in DevTools
3. **System Preference**: Change your OS theme settings

## Troubleshooting

### Theme Flashing on Page Load

Add `suppressHydrationWarning` to the `<html>` tag (already done in `app/layout.tsx`):

```tsx
<html lang="en" suppressHydrationWarning>
```

### Theme Not Persisting

Check that localStorage is enabled and the storage key is correct in `theme-config.ts`.

### Colors Not Updating

1. Clear browser cache
2. Restart dev server
3. Check CSS variable names match in both `globals.css` and components

## Best Practices

1. **Use CSS Variables**: Always use CSS variables instead of hardcoded colors
2. **Test Both Themes**: Ensure your custom colors work in both light and dark mode
3. **Maintain Contrast**: Ensure sufficient contrast for accessibility (WCAG AA)
4. **Consistent Naming**: Keep color variable names consistent across themes
5. **Document Changes**: Document any custom color choices for your team

## Resources

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
