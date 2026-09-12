"use client";

import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { MIN_GRADES } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { ArrowRight, Cpu, Database, DesktopTower, ChartLineUp, AppWindow, Brain } from "@phosphor-icons/react";

export const majors = [
  {
    id: "Information_Systems",
    title: "Information Systems",
    grade: MIN_GRADES.Information_Systems,
    desc: "Bridge the gap between business processes and complex data systems.",
    icon: <Database size={32} weight="light" />,
  },
  {
    id: "Computer_Science",
    title: "Computer Science",
    grade: MIN_GRADES.Computer_Science,
    desc: "Dive deep into algorithms, architecture, and the core of computation.",
    icon: <Cpu size={32} weight="light" />,
  },
  {
    id: "Artificial_Intelligence",
    title: "Artificial Intelligence",
    grade: MIN_GRADES.Artificial_Intelligence,
    desc: "Build the future with machine learning, neural networks, and cognitive computing.",
    icon: <Brain size={32} weight="light" />,
  },
  {
    id: "Decision_Support_and_Operations_Research",
    title: "Decision Support & Operations Research",
    grade: MIN_GRADES.Decision_Support,
    desc: "Leverage big data, operations research, and predictive models.",
    icon: <ChartLineUp size={32} weight="light" />,
  },
  {
    id: "Information_Technology",
    title: "Information Technology",
    grade: MIN_GRADES.Information_Technology,
    desc: "Master the infrastructure, networks, and systems that power the modern world.",
    icon: <DesktopTower size={32} weight="light" />,
  },
];

export function MajorBento() {
  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>FCAI Courses Explorer</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto' }}>Select a specialization to explore its full curriculum and requirements.</p>
      </div>
      
      <div className="bento-grid">
        {majors.map((major, i) => (
          <MajorCard key={major.id} major={major} index={i} />
        ))}
      </div>
    </div>
  );
}

function MajorCard({ major, index }: { major: typeof majors[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.32, 0.72, 0, 1],
      }}
      style={{ display: 'flex' }}
    >
      <Link href={`/majors/${major.id}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%', display: 'flex' }}>
        <Card style={{ cursor: 'pointer', width: '100%' }}>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--foreground)' }}>{major.icon}</div>
              <div style={{
                background: 'var(--card-bg-outer)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}>
                MIN {major.grade.toFixed(2)}
              </div>
            </div>
            <CardTitle style={{ marginTop: '1.5rem' }}>{major.title}</CardTitle>
            <CardDescription style={{ marginTop: '0.5rem' }}>{major.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', opacity: 0.7, marginTop: '1rem' }}>
              <span>View Curriculum</span>
              <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
