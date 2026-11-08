import { useState } from "react";
import Container from "./Container";
import { useLanguage } from "../../hooks/useLanguage";
import site from "../../content/site.json";

const ALL_NAV_KEYS = [
  ["home", "#home"],
  ["experience", "#experience"],
  ["individual", "#individual"],
  ["corporate", "#corporate"],
  ["companies", "#companies"],
  ["plans", "#plans"],
  ["about", "#about"],
  ["services", "#services"],
  ["calculators", "#calculators"],
  ["videos", "#videos"],
  ["faq", "#faq"],
  ["contact", "#contact"],
];

const DESKTOP_NAV_KEYS = ["individual", "corporate", "about", "calculators", "videos", "faq", "contact"];

export default function Header() {
  const { t, lang, toggle } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const hindi = lang === "hi" ? "font-hindi" : "";

  const hrefFor = (key) => ALL_NAV_KEYS.find(([k]) => k === key)?.[1];
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-navy text-soft-white shadow-md">
      <Container className="flex items-center justify-between gap-4 py-3">
        {/* Brand */}
        <a href="#home" className="flex items-center gap-3" onClick={closeMenu}>
          <img src="/logo/aks-logo.svg" alt={`${site.brand.name} logo`} className="h-10 w-10" />
          <span className="leading-tight">
            <span className="block font-heading text-base font-bold sm:text-lg">
              {site.brand.name}
            </span>
            <span className="block text-[11px] font-medium tracking-wide text-gold sm:text-xs">
              Insurance Portfolio
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className={`flex items-center gap-5 text-sm font-medium ${hindi}`}>
            {DESKTOP_NAV_KEYS.map((key) => (
              <li key={key}>
                <a href={hrefFor(key)} className="transition-colors hover:text-gold">
                  {t.nav[key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language toggle */}
          <button
            type="button"
            onClick={toggle}
            className={`rounded-md border border-gold px-3 py-1.5 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-navy ${hindi}`}
            aria-label={`${t.language.switchAria} — ${t.language.switchTo}`}
          >
            {t.language.switchTo}
          </button>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="rounded-md border border-soft-white/30 p-2 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* Mobile nav */}
      {menuOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-soft-white/10 lg:hidden">
          <Container>
            <ul className={`flex flex-col py-2 text-sm font-medium ${hindi}`}>
              {ALL_NAV_KEYS.map(([key, href]) => (
                <li key={key}>
                  <a
                    href={href}
                    onClick={closeMenu}
                    className="block border-b border-soft-white/5 py-3 transition-colors hover:text-gold"
                  >
                    {t.nav[key]}
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
