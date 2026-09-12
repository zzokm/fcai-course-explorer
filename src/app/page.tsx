import { MajorBento } from "@/components/ui/major-bento";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div className="radial-mesh" />
      <ThemeToggle />
      <div style={{ width: '100%', padding: '2rem' }}>
        <MajorBento />
      </div>
    </main>
  );
}
