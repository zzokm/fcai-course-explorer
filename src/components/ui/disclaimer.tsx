"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info, X, WarningCircle, DownloadSimple, FileText, FilePdf } from "@phosphor-icons/react/dist/ssr";

const downloads = [
  {
    id: "ai-bylaw-2020",
    label: "AI Bylaw 2020",
    description: "Official AI Department Bylaw (PDF)",
    icon: FilePdf,
    color: "#ef4444",
  },
  {
    id: "bylaw-2024",
    label: "General Bylaw 2024",
    description: "Full Faculty Bylaw — All Majors (PDF)",
    icon: FilePdf,
    color: "#ef4444",
  },
  {
    id: "courses-json",
    label: "Courses Data",
    description: "Structured course data used by this site (JSON)",
    icon: FileText,
    color: "#6366f1",
  },
];

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
          fontFamily: "var(--font-jakarta), system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.45rem 1rem",
          background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
          border: "1px solid color-mix(in srgb, var(--foreground) 12%, transparent)",
          borderRadius: "9999px",
          color: "color-mix(in srgb, var(--foreground) 65%, transparent)",
          fontSize: "0.8125rem",
          fontWeight: 500,
          cursor: "pointer",
          letterSpacing: "0.01em",
          transition: "all 0.18s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "color-mix(in srgb, var(--foreground) 10%, transparent)";
          e.currentTarget.style.color = "color-mix(in srgb, var(--foreground) 85%, transparent)";
          e.currentTarget.style.borderColor = "color-mix(in srgb, var(--foreground) 20%, transparent)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "color-mix(in srgb, var(--foreground) 6%, transparent)";
          e.currentTarget.style.color = "color-mix(in srgb, var(--foreground) 65%, transparent)";
          e.currentTarget.style.borderColor = "color-mix(in srgb, var(--foreground) 12%, transparent)";
        }}
      >
        <WarningCircle size={15} weight="regular" />
        <span>Disclaimer & Data Sources</span>
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
              background: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={() => setIsOpen(false)}
          >
            <div
              style={{
                fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                position: "relative",
                background: "var(--background)",
                border: "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
                borderRadius: "18px",
                padding: "1.75rem",
                width: "100%",
                maxWidth: "480px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 32px 64px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.04)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  position: "absolute",
                  top: "1.1rem",
                  right: "1.1rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "color-mix(in srgb, var(--foreground) 45%, transparent)",
                  padding: "0.3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "color-mix(in srgb, var(--foreground) 8%, transparent)";
                  e.currentTarget.style.color = "var(--foreground)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "color-mix(in srgb, var(--foreground) 45%, transparent)";
                }}
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.25rem" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  background: "color-mix(in srgb, var(--foreground) 7%, transparent)",
                  color: "color-mix(in srgb, var(--foreground) 70%, transparent)",
                  flexShrink: 0,
                }}>
                  <Info size={20} weight="regular" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
                    Disclaimer & Data Sources
                  </h3>
                  <p style={{ fontSize: "0.75rem", margin: 0, marginTop: "0.1rem", color: "color-mix(in srgb, var(--foreground) 50%, transparent)" }}>
                    Please read before using this site
                  </p>
                </div>
              </div>

              {/* Body */}
              <div style={{ fontSize: "0.95rem", lineHeight: 1.65, color: "color-mix(in srgb, var(--foreground) 80%, transparent)" }}>
                <p style={{ margin: "0 0 0.85rem" }}>
                  The minimum GPA values shown are based on last year's admissions and will be updated once this year's minimums are officially confirmed.
                </p>
                <p style={{ margin: "0 0 0.85rem" }}>
                  All course information on this site, including prerequisites, credit hours, and section requirements, is extracted directly from the official college bylaws.
                </p>
                <div style={{
                  padding: "0.85rem 1rem",
                  background: "color-mix(in srgb, var(--foreground) 5%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
                  borderRadius: "10px",
                  marginBottom: "0.85rem",
                  fontSize: "0.8375rem",
                }}>
                  <strong style={{ color: "var(--foreground)" }}>Do not rely on this as your sole source.</strong>{" "}
                  Always explore the full rules, regulations, and official documentation in the bylaws, and consult your academic advisor before making any decisions about your major or course plan.
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: "color-mix(in srgb, var(--foreground) 8%, transparent)", margin: "1.25rem 0" }} />

              {/* Downloads */}
              <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "color-mix(in srgb, var(--foreground) 45%, transparent)", margin: "0 0 0.75rem", fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>
                Download Source Files
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {downloads.map(({ id, label, description, icon: Icon, color }) => (
                  <a
                    key={id}
                    href={`/api/download/${id}`}
                    download
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.85rem",
                      padding: "0.75rem 1rem",
                      background: "color-mix(in srgb, var(--foreground) 4%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--foreground) 9%, transparent)",
                      borderRadius: "10px",
                      textDecoration: "none",
                      color: "var(--foreground)",
                      transition: "background 0.15s, border-color 0.15s",
                      fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "color-mix(in srgb, var(--foreground) 8%, transparent)";
                      e.currentTarget.style.borderColor = "color-mix(in srgb, var(--foreground) 16%, transparent)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "color-mix(in srgb, var(--foreground) 4%, transparent)";
                      e.currentTarget.style.borderColor = "color-mix(in srgb, var(--foreground) 9%, transparent)";
                    }}
                  >
                    <Icon size={20} weight="duotone" style={{ color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "-0.005em" }}>{label}</div>
                      <div style={{ fontSize: "0.75rem", color: "color-mix(in srgb, var(--foreground) 50%, transparent)", marginTop: "0.05rem" }}>{description}</div>
                    </div>
                    <DownloadSimple size={16} style={{ color: "color-mix(in srgb, var(--foreground) 35%, transparent)", flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
