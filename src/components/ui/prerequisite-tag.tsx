"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PrereqNode } from "@/lib/data";
import { AnimatePresence, motion } from "motion/react";
import { X, Clock, Tag, TreeStructure, BookOpen, ArrowRight } from "@phosphor-icons/react";

// Recursive prerequisite tree node
function PrereqTreeNode({ node, depth = 0 }: { node: PrereqNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = node.children.length > 0;
  const isTextOnly = !node.course;

  return (
    <div style={{ marginLeft: depth > 0 ? '1.5rem' : 0 }}>
      <div
        onClick={() => hasChildren && setExpanded(e => !e)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          background: depth === 0 ? 'var(--card-bg-outer)' : 'transparent',
          border: depth === 0 ? '1px solid var(--card-border-outer)' : 'none',
          cursor: hasChildren ? 'pointer' : 'default',
          transition: 'background 0.15s',
          marginBottom: '0.5rem',
          position: 'relative',
        }}
      >
        {/* Connector line for nested items */}
        {depth > 0 && (
          <div style={{
            position: 'absolute',
            left: '-1rem',
            top: '50%',
            width: '1rem',
            height: '1px',
            background: 'var(--card-border-outer)',
          }} />
        )}

        <div style={{
          flexShrink: 0,
          width: '2rem',
          height: '2rem',
          borderRadius: '0.5rem',
          background: isTextOnly ? 'rgba(128,128,128,0.15)' : 'var(--foreground)',
          color: isTextOnly ? 'var(--foreground)' : 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.02em',
        }}>
          {isTextOnly ? '!' : node.code.replace(/[^A-Z]/gi, '').slice(0, 2).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {node.course ? node.course.name : node.code}
            </span>
            {node.course && (
              <span style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 500 }}>{node.code}</span>
            )}
          </div>
          {node.course && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Clock size={11} /> {node.course.credit_hours} Credits
              </span>
              {node.course.type && (
                <span style={{ fontSize: '0.7rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Tag size={11} /> {node.course.type}
                </span>
              )}
            </div>
          )}
          {node.course?.description && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', opacity: 0.65, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {node.course.description}
            </p>
          )}
          {isTextOnly && (
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', opacity: 0.6 }}>
              Non-course requirement
            </p>
          )}
        </div>

        {hasChildren && (
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ flexShrink: 0, opacity: 0.5 }}
          >
            <ArrowRight size={14} />
          </motion.div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden', borderLeft: '1px solid var(--card-border-outer)', marginLeft: '1.5rem', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}
          >
            {node.children.map(child => (
              <PrereqTreeNode key={child.code} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PrerequisiteTag({ code, chain }: { code: string; chain: PrereqNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const course = chain.course;

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          background: course ? 'var(--foreground)' : 'rgba(128,128,128,0.2)',
          color: course ? 'var(--background)' : 'var(--foreground)',
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px',
          fontWeight: 500,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          transition: 'opacity 0.15s',
        }}
      >
        {course ? course.name : code}
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
              />

              {/* Modal card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', bounce: 0.3, duration: 0.45 }}
                style={{
                  position: 'relative',
                  zIndex: 10,
                  width: '100%',
                  maxWidth: '680px',
                  maxHeight: '85vh',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '1.25rem',
                  background: 'var(--background)',
                  border: '1px solid var(--card-border-outer)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div style={{ padding: '1.75rem 1.75rem 1.25rem', borderBottom: '1px solid var(--card-border-outer)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem',
                        background: 'var(--foreground)', color: 'var(--background)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <BookOpen size={22} weight="bold" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          Prerequisite
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.2 }}>
                          {course ? course.name : code}
                        </h2>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      style={{ background: 'var(--card-bg-outer)', border: '1px solid var(--card-border-outer)', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--foreground)', flexShrink: 0 }}
                    >
                      <X size={16} weight="bold" />
                    </button>
                  </div>

                  {/* Badges */}
                  {course && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 500, background: 'var(--card-bg-outer)', border: '1px solid var(--card-border-outer)', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
                        <Clock size={14} /> {course.credit_hours} Credits
                      </span>
                      {course.type && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 500, background: 'var(--card-bg-outer)', border: '1px solid var(--card-border-outer)', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
                          <Tag size={14} /> {course.type}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 500, background: 'var(--card-bg-outer)', border: '1px solid var(--card-border-outer)', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
                        {code}
                      </span>
                    </div>
                  )}
                </div>

                {/* Scrollable body */}
                <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
                  {/* Description */}
                  {course?.description && (
                    <div style={{ marginBottom: '1.75rem' }}>
                      <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5 }}>Description</h3>
                      <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.85, lineHeight: 1.65 }}>
                        {course.description}
                      </p>
                    </div>
                  )}

                  {/* Prerequisite chain */}
                  {chain.children.length > 0 && (
                    <div>
                      <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <TreeStructure size={14} /> Prerequisite Chain
                      </h3>
                      {chain.children.map(child => (
                        <PrereqTreeNode key={child.code} node={child} depth={0} />
                      ))}
                    </div>
                  )}

                  {chain.children.length === 0 && (
                    <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.5, fontStyle: 'italic', textAlign: 'center', paddingTop: '0.5rem' }}>
                      No further prerequisites.
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
