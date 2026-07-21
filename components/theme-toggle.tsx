"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Laptop } from "lucide-react";

const OPTIONS = ["light", "dark", "system"] as const;
const ICONS = { light: Sun, dark: Moon, system: Laptop };

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  const current = (theme as (typeof OPTIONS)[number]) ?? "system";
  const next = OPTIONS[(OPTIONS.indexOf(current) + 1) % OPTIONS.length];
  const Icon = ICONS[current];

  return (
    <button
      onClick={() => setTheme(next)}
      title={`Theme: ${current} (click for ${next})`}
      className="h-9 w-9 grid place-items-center rounded-lg border border-border bg-surface hover:bg-surface-2 transition"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
