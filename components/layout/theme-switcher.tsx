"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/**
 * ThemeSwitcher - Toggle between light/dark/system themes
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Switch to dark mode";
      case "dark":
        return "Switch to system mode";
      case "system":
        return "Switch to light mode";
      default:
        return "Toggle theme";
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="h-9 w-9 p-0"
      aria-label={getLabel()}
    >
      {getIcon()}
    </Button>
  );
}

export interface ThemeSwitcherDropdownProps {
  className?: string;
}

/**
 * ThemeSwitcherDropdown - Dropdown menu for theme selection
 */
export function ThemeSwitcherDropdown({
  className = "",
}: ThemeSwitcherDropdownProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-muted-foreground mb-1">
        Theme
      </span>
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
            theme === value
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export interface ThemeSwitcherCompactProps {
  showLabel?: boolean;
  className?: string;
}

/**
 * ThemeSwitcherCompact - Compact theme switcher with optional label
 */
export function ThemeSwitcherCompact({
  showLabel = false,
  className = "",
}: ThemeSwitcherCompactProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-foreground">Theme:</span>
      )}
      <div className="flex items-center rounded-lg border border-border bg-background p-1">
        <button
          onClick={() => setTheme("light")}
          className={`rounded-md p-1.5 transition-colors ${
            theme === "light"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
          aria-label="Light mode"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`rounded-md p-1.5 transition-colors ${
            theme === "dark"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
          aria-label="Dark mode"
        >
          <Moon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme("system")}
          className={`rounded-md p-1.5 transition-colors ${
            theme === "system"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
          aria-label="System mode"
        >
          <Monitor className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
