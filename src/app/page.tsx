import HeroSection from "./components/HeroSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-300">
      <div className="container mt-12 mx-auto px-12 py-8">
        <HeroSection />
      </div>
    </main>
  );
}
