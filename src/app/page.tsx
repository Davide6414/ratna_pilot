import { LetterGrid } from "@/components/LetterGrid/LetterGrid";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";
import { site } from "@/config/site";

export default function HomePage() {
  return (
    <main>
      <h1 className="visually-hidden">{site.name}</h1>
      <LetterGrid />
      <SiteFooter />
    </main>
  );
}
