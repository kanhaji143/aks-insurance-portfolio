import { Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./hooks/useLanguage";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import Experience from "./components/sections/Experience";
import Segments from "./components/sections/Segments";
import Categories from "./components/sections/Categories";
import Companies from "./components/sections/Companies";
import Plans from "./components/sections/Plans";
import About from "./components/sections/About";
import Services from "./components/sections/Services";
import Calculators from "./components/sections/Calculators";
import VideoGallery from "./components/sections/VideoGallery";
import Faq from "./components/sections/Faq";
import Contact from "./components/sections/Contact";
import AdminApp from "./admin/AdminApp";

function PublicSite() {
  return (
    <LanguageProvider>
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">
          <Hero />
          <Experience />
          <Segments />
          <Categories />
          <Companies />
          <Plans />
          <About />
          <Services />
          <Calculators />
          <VideoGallery />
          <Faq />
          <Contact />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
