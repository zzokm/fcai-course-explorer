import { MajorBento } from "@/components/ui/major-bento";
import { ThemeToggle } from "@/components/theme-toggle";
import { Disclaimer } from "@/components/ui/disclaimer";
import { Star } from "@phosphor-icons/react/dist/ssr";

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

        <footer className="author-credits">
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Made by Yehia Elzokm</span>
          <a
            href="https://github.com/zzokm/fcai-course-explorer"
            target="_blank"
            rel="noopener noreferrer"
            className="github-star-btn"
          >
            <Star weight="fill" size={14} color="#eab308" className="star-icon" />
            <span>Star on GitHub</span>
          </a>
        </footer>
      </div>
    </main>
  );
}
