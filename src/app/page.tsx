import { Thesis } from "@/components/home/Thesis";
import { Pillars } from "@/components/home/Pillars";

export default function HomePage() {
  return (
    <div className="pt-28 pb-20 xl:pt-36">
      <Thesis />
      <Pillars />
    </div>
  );
}
