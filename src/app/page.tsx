'use client';

import Image from "next/image";
import { HeroSection } from "./components/HeroSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-olive">
      <div className="container mx-auto px-12 py-2">
        <HeroSection />
      </div>
    </main>
  );
}
