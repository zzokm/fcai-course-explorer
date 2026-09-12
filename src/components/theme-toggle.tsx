"use client";

import * as React from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

export function ThemeToggle({ style }: { style?: React.CSSProperties }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div 
        style={{ 
          width: '72px', 
          height: '38px', 
          borderRadius: '9999px',
          background: 'rgba(128,128,128,0.1)',
          ...style 
        }} 
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      style={{
        position: 'relative',
        width: '72px',
        height: '38px',
        borderRadius: '9999px',
        background: 'rgba(128,128,128,0.1)',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.3s ease',
        ...style
      }}
    >
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          background: 'var(--background)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--foreground)',
          transform: `translateX(${isDark ? '34px' : '0'})`,
          transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), background 0.3s ease',
        }}
      >
        {isDark ? (
          <Moon size={16} weight="fill" />
        ) : (
          <Sun size={16} weight="fill" />
        )}
      </div>
    </button>
  );
}
