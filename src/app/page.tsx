import HeroSection from "./components/HeroSection";
import NavigationBar from "./components/NavigationBar"
import AboutSection from "./components/AboutSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-olive">
      {/* <NavigationBar /> */}
      <div className="container mt-12 mx-auto px-12 py-8">
        <HeroSection />
        <AboutSection />
      </div>
    </main>
  );
}
