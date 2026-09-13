"use client";

import React, { useState, useRef, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";

export interface DropdownOption {
  id: string;
  name: string;
}

interface CustomDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxHeight?: string;
  triggerStyle?: React.CSSProperties;
  dropdownStyle?: React.CSSProperties;
  searchable?: boolean;
}

export function CustomDropdown({ 
  value, 
  options, 
  onChange, 
  disabled, 
  placeholder = "Select...", 
  maxHeight = "250px",
  triggerStyle,
  dropdownStyle,
  searchable = false
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.id === value);
  const filteredOptions = searchable 
    ? options.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button 
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          background: 'var(--card-bg)', border: '1px solid var(--card-border-outer)', color: 'var(--foreground)',
          padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          fontSize: '0.875rem', opacity: disabled ? 0.5 : 1,
          ...triggerStyle
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <CaretDown size={16} style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
      </button>
      
      {isOpen && !disabled && (
        <div 
          className="custom-scrollbar"
          style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem',
          background: 'var(--background)', border: '1px solid var(--card-border-outer)',
          borderRadius: '0.5rem', padding: '0.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 1000,
          maxHeight: maxHeight, overflowY: 'auto',
          ...dropdownStyle
        }}>
          {searchable && (
            <input 
              autoFocus
              type="text"
              placeholder="Search options..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '0.6rem 0.75rem', marginBottom: '0.5rem',
                background: 'var(--background)', border: '1px solid var(--card-border-outer)',
                borderRadius: '0.35rem', color: 'var(--foreground)',
                fontFamily: 'inherit', fontSize: '0.85rem', outline: 'none'
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          )}
          {filteredOptions.length > 0 ? filteredOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              style={{
                textDecoration: 'none', color: 'var(--foreground)', padding: '0.5rem 1rem', borderRadius: '0.25rem',
                background: opt.id === value ? 'var(--card-bg-outer)' : 'transparent',
                fontWeight: opt.id === value ? 600 : 400,
                textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem',
                transition: 'background 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (opt.id !== value) {
                  e.currentTarget.style.background = 'var(--card-bg-outer)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (opt.id !== value) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              {opt.name}
            </button>
          )) : (
            <div style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: 0.5 }}>No options found</div>
          )}
        </div>
      )}
    </div>
  );
}
