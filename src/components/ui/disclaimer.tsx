"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info, X, WarningCircle } from "@phosphor-icons/react/dist/ssr";

export function Disclaimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '9999px',
          color: 'var(--foreground)',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }}
      >
        <WarningCircle size={18} weight="duotone" style={{ color: 'var(--prereq-color, #f59e0b)' }} />
        <span>Data Source & Disclaimer</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={() => setIsOpen(false)}
          >
            <div
              style={{
                position: "relative",
                background: "var(--background)",
                border: "1px solid var(--card-border-outer)",
                borderRadius: "16px",
                padding: "2rem",
                width: "100%",
                maxWidth: "500px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--foreground)",
                  opacity: 0.7,
                  padding: "0.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "opacity 0.2s, background 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.background = "var(--card-bg-outer)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <X size={20} />
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: 'var(--card-bg-outer)',
                  color: 'var(--prereq-color, #f59e0b)'
                }}>
                  <Info size={24} weight="duotone" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Disclaimer</h3>
              </div>
              
              <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--foreground)', opacity: 0.9 }}>
                <p style={{ marginBottom: '1rem' }}>
                  All course information presented here, including prerequisites and credit hours, is extracted directly from the official college bylaws.
                </p>
                <div style={{ 
                  padding: '1rem', 
                  background: 'var(--card-bg)', 
                  borderLeft: '3px solid var(--prereq-color, #f59e0b)',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: '1rem'
                }}>
                  <strong>Important:</strong> Please do not use this tool as your sole source of information when deciding what to major in or planning your courses.
                </div>
                <p style={{ margin: 0 }}>
                  We strongly advise you to explore all the rules, laws, and official documentation provided in the college bylaws and consult with your academic advisor before making any decisions.
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
