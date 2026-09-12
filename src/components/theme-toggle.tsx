"use client";

import * as React from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

export function ThemeToggle({ style }: { style?: React.CSSProperties }) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      style={{
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        background: 'var(--card-bg-outer)',
        border: '1px solid var(--card-border-outer)',
        borderRadius: '50%',
        width: '3rem',
        height: '3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--foreground)',
        zIndex: 40,
        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(8px)',
        ...style
      }}
      aria-label="Toggle theme"
    >
      <Sun size={24} weight="light" className="sun-icon" />
      <Moon size={24} weight="light" className="moon-icon" />
      <style dangerouslySetInnerHTML={{__html: `
        .sun-icon { display: none; }
        .moon-icon { display: block; }
        .dark .sun-icon { display: block; }
        .dark .moon-icon { display: none; }
      `}} />
    </button>
  );
}
