import Link from "next/link";
import HeroSection from "./components/HeroSection";
import MiddleSection from "./components/MiddleSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection/>
      <MiddleSection/>
      <Footer/>
    </main>
    
  );
}