import Image from "next/image";
import { HeroSection } from "./components/HeroSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black container mx-auto p-2">
      <HeroSection />
    </main>
  );
}
