import { LogoGrid } from "@/components/LogoGrid/LogoGrid";
import { site } from "@/config/site";

export default function HomePage() {
  return (
    <main>
      <h1 className="visually-hidden">{site.name}</h1>
      <LogoGrid />
    </main>
  );
}
