import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCoursesData, getPrerequisiteChain } from "@/lib/data";
import { ThemeToggle } from "@/components/theme-toggle";
import { PrerequisiteTag } from "@/components/ui/prerequisite-tag";
import { MajorDropdown } from "@/components/ui/major-dropdown";
import { ElectiveInfo } from "@/components/ui/elective-info";
import { ArrowLeft, Clock, Tag, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { majors } from "@/components/ui/major-bento";

const majorNames: Record<string, string> = {
  Computer_Science: "Computer Science",
  Information_Systems: "Information Systems",
  Artificial_Intelligence: "Artificial Intelligence",
  Decision_Support_and_Operations_Research: "Decision Support & Operations Research",
  Information_Technology: "Information Technology",
};

export default async function MajorPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const data = getCoursesData();
  const majorData = (data.majors as any)[id];

  if (!majorData) {
    notFound();
  }

  const reqs = majorData.major_requirements;

  const calculatedTotalCredits = Object.entries(reqs).reduce((total, [key, section]: [string, any]) => {
    if (key === 'title' || key === 'total_credit_hours') return total;
    return total + (section.credit_hours || 0);
  }, 0);

  const renderSection = (section: any) => {
    if (!section || !section.courses || section.courses.length === 0) return null;
    
    let displayTitle = section.title;
    const isElective = displayTitle.toLowerCase().includes("elective");
    if (isElective) {
      displayTitle = "Elective Courses";
    }

    return (
      <div key={section.title} style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--card-border-outer)' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
            {displayTitle}{isElective && <ElectiveInfo creditHours={section.credit_hours} />}
          </h2>
          <span style={{ fontSize: '1rem', opacity: 0.7, background: 'var(--card-bg-outer)', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
            {section.credit_hours} Credits
          </span>
        </div>
        
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr' }}>
          {section.courses.map((course: any) => (
            <div key={course.code} style={{
              background: 'var(--card-bg-outer)',
              border: '1px solid var(--card-border-outer)',
              borderRadius: '1rem',
              padding: '1.5rem',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--foreground)' }}>{course.code}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', opacity: 0.7, background: 'rgba(128,128,128,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      <Clock size={14} /> {course.credit_hours} Credits
                    </span>
                    {course.type && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', opacity: 0.7, background: 'rgba(128,128,128,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        <Tag size={14} /> {course.type}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{course.name}</h3>
                </div>
              </div>
              
              <p style={{ marginTop: '1rem', fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.6 }}>
                {course.description || "No description provided for this course."}
              </p>

              {course.prerequisites && course.prerequisites.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--card-border-outer)', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 600, opacity: 0.7 }}>Prerequisites:</span>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {course.prerequisites.map((prereq: string) => {
                      const chain = getPrerequisiteChain(prereq);
                      return <PrerequisiteTag key={prereq} code={prereq} chain={chain} />;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main style={{ minHeight: '100dvh', position: 'relative' }}>
      {/* Top Navigation Bar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--card-bg-outer)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--card-border-outer)',
        padding: '1rem 0'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--foreground)', fontWeight: 500, opacity: 0.8 }}>
            <ArrowLeft size={20} />
            Back to Majors
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <MajorDropdown currentId={id} />
            <ThemeToggle style={{ position: 'relative', top: 'auto', right: 'auto' }} />
          </div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '6rem', maxWidth: '900px' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card-bg-outer)', padding: '1rem', borderRadius: '1.5rem', marginBottom: '1.5rem', color: 'var(--foreground)' }}>
            {majors.find(m => m.id === id)?.icon ? React.cloneElement(majors.find(m => m.id === id)!.icon as React.ReactElement<any>, { size: 48, weight: "light" }) : null}
          </div>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{majorData.title}</h1>
          <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', opacity: 0.8 }}>
            Total Credit Hours: <strong style={{ color: 'var(--foreground)' }}>{calculatedTotalCredits}</strong>
          </p>
        </header>

        <section>
          {Object.entries(reqs)
            .filter(([key]) => key !== 'title' && key !== 'total_credit_hours')
            .sort(([a], [b]) => {
              if (a === 'graduation_project') return 1;
              if (b === 'graduation_project') return -1;
              return 0;
            })
            .map(([, section]) => renderSection(section))}
        </section>
      </div>

    </main>
  );
}
