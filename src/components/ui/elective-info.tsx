"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";

interface ElectiveInfoProps {
  creditHours: number;
}

export function ElectiveInfo({ creditHours }: ElectiveInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const open = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
    setIsOpen(true);
  };

  // Derived split: 2/3 department, 1/3 open
  const deptHours = Math.round((creditHours / 3) * 2);
  const openHours = creditHours - deptHours;

  return (
    <>
      <button
        ref={btnRef}
        onClick={open}
        aria-label="Elective course rules"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--foreground)",
          opacity: 0.45,
          padding: "0.15rem",
          display: "inline-flex",
          alignItems: "center",
          transition: "opacity 0.15s",
          verticalAlign: "middle",
          marginLeft: "0.4rem",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0.45")}
      >
        <Info size={18} weight="fill" />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Dismiss overlay */}
              <div
                onClick={() => setIsOpen(false)}
                style={{ position: "fixed", inset: 0, zIndex: 88888 }}
              />

              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: "absolute",
                  top: pos.top,
                  left: pos.left,
                  zIndex: 99999,
                  width: "min(420px, calc(100vw - 2rem))",
                  background: "var(--background)",
                  border: "1px solid var(--card-border-outer)",
                  borderRadius: "1rem",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.9rem" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Info size={15} weight="fill" style={{ opacity: 0.6 }} />
                    Elective Selection Rules
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground)", opacity: 0.5, padding: 0, display: "flex" }}
                  >
                    <X size={16} weight="bold" />
                  </button>
                </div>

                <p style={{ margin: "0 0 0.75rem", fontSize: "0.83rem", opacity: 0.7, lineHeight: 1.55 }}>
                  The <strong>{creditHours} elective credit hours</strong> are chosen based on the student's preference and are divided as follows:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <div style={{
                    display: "flex", gap: "0.75rem", alignItems: "flex-start",
                    background: "var(--card-bg-outer)", border: "1px solid var(--card-border-outer)",
                    borderRadius: "0.65rem", padding: "0.7rem 0.85rem",
                  }}>
                    <span style={{
                      flexShrink: 0, fontWeight: 800, fontSize: "1.1rem",
                      background: "var(--foreground)", color: "var(--background)",
                      borderRadius: "0.4rem", padding: "0.1rem 0.45rem", lineHeight: 1.3,
                    }}>{deptHours}</span>
                    <p style={{ margin: 0, fontSize: "0.82rem", opacity: 0.8, lineHeight: 1.5 }}>
                      Credit hours chosen from the <strong>department's listed elective courses</strong>.
                    </p>
                  </div>

                  <div style={{
                    display: "flex", gap: "0.75rem", alignItems: "flex-start",
                    background: "var(--card-bg-outer)", border: "1px solid var(--card-border-outer)",
                    borderRadius: "0.65rem", padding: "0.7rem 0.85rem",
                  }}>
                    <span style={{
                      flexShrink: 0, fontWeight: 800, fontSize: "1.1rem",
                      background: "var(--foreground)", color: "var(--background)",
                      borderRadius: "0.4rem", padding: "0.1rem 0.45rem", lineHeight: 1.3,
                    }}>{openHours}</span>
                    <p style={{ margin: 0, fontSize: "0.82rem", opacity: 0.8, lineHeight: 1.5 }}>
                      Credit hours chosen either from the <strong>department's elective courses</strong>, or from <strong>mandatory or elective courses of another department</strong>.
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
