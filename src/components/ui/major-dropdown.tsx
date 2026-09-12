"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react";

const majorNames: Record<string, string> = {
  Computer_Science: "Computer Science",
  Information_Systems: "Information Systems",
  Artificial_Intelligence: "Artificial Intelligence",
  Decision_Support_and_Operations_Research: "Decision Support & Operations Research",
  Information_Technology: "Information Technology",
};

export function MajorDropdown({ currentId }: { currentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(128,128,128,0.1)', border: 'none', color: 'var(--foreground)',
          padding: '0.5rem 1rem', borderRadius: '9999px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500
        }}
      >
        {majorNames[currentId]} <CaretDown size={16} />
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
          background: 'var(--background)', border: '1px solid var(--card-border-outer)',
          borderRadius: '1rem', padding: '0.5rem', minWidth: '200px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 50
        }}>
          {Object.entries(majorNames).map(([key, name]) => (
            <Link key={key} href={`/majors/${key}`} onClick={() => setIsOpen(false)} style={{
              textDecoration: 'none', color: 'var(--foreground)', padding: '0.5rem 1rem', borderRadius: '0.5rem',
              background: key === currentId ? 'var(--card-bg-outer)' : 'transparent',
              fontWeight: key === currentId ? 600 : 400,
              transition: 'background 0.2s ease, transform 0.2s ease',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              if (key !== currentId) {
                e.currentTarget.style.background = 'var(--card-bg-outer)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (key !== currentId) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
            >
              {name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
