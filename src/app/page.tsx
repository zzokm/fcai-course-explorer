import { MajorBento } from "@/components/ui/major-bento";
import { ThemeToggle } from "@/components/theme-toggle";
import { Disclaimer } from "@/components/ui/disclaimer";

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
      </div>
    </main>
  );
}
