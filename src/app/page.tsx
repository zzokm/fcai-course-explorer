import { MajorBento } from "@/components/ui/major-bento";
import { ThemeToggle } from "@/components/theme-toggle";
import { Disclaimer } from "@/components/ui/disclaimer";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <main style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div className="radial-mesh" />
      <ThemeToggle />
      <div style={{ width: '100%', padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
        <MajorBento />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', marginBottom: '1.5rem' }}>
          <Disclaimer />
        </div>

        <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem', paddingBottom: '2rem', opacity: 0.8 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Made by Yehia Elzokm</span>
          <a
            href="https://github.com/zzokm/fcai-course-explorer"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.75rem',
              background: 'var(--card-bg-inner)',
              border: '1px solid var(--card-border-inner)',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textDecoration: 'none',
              color: 'inherit',
              transition: 'background 0.2s ease',
            }}
            className="github-star-btn"
          >
            <GithubLogo weight="fill" size={14} /> Star on GitHub
          </a>
        </footer>
      </div>
    </main>
  );
}
