"use client";

import * as React from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

export function ThemeToggle({ style }: { style?: React.CSSProperties }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div 
        style={{ 
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 40,
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
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 40,
        width: '72px',
        height: '38px',
        borderRadius: '9999px',
        background: 'rgba(128,128,128,0.1)',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isDark ? 'flex-end' : 'flex-start',
        transition: 'background 0.3s ease',
        ...style
      }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
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
        }}
      >
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ y: -10, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Moon size={16} weight="fill" /> : <Sun size={16} weight="fill" />}
        </motion.div>
      </motion.div>
    </button>
  );
}
