import Container from "./Container";
import { useLanguage } from "../../hooks/useLanguage";
import site from "../../content/site.json";

const QUICK_KEYS = ["individual", "corporate", "companies", "plans", "about", "services", "calculators", "videos", "faq", "contact"];
const NAV_HREFS = {
  home: "#home",
  experience: "#experience",
  individual: "#individual",
  corporate: "#corporate",
  categories: "#categories",
  companies: "#companies",
  plans: "#plans",
  about: "#about",
  services: "#services",
  calculators: "#calculators",
  videos: "#videos",
  faq: "#faq",
  contact: "#contact",
};

export default function Footer() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";

  return (
    <footer className="bg-navy text-soft-white">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo/aks-logo.svg" alt="" className="h-10 w-10" />
            <span className="font-heading text-lg font-bold">{site.brand.name}</span>
          </div>
          <p className={`mt-3 text-sm leading-relaxed text-soft-white/80 ${hindi}`}>
            {site.brand.tagline[lang]}
          </p>
          <p className="mt-2 text-xs text-soft-white/60">
            {site.serviceArea.primary.join(" · ")} — {site.serviceArea.region}
          </p>
        </div>

        {/* Quick links */}
        <nav aria-label="Footer">
          <h3 className={`font-heading text-sm font-bold uppercase tracking-wider text-gold ${hindi}`}>
            {t.footer.quickLinks}
          </h3>
          <ul className={`mt-3 space-y-2 text-sm ${hindi}`}>
            {QUICK_KEYS.map((key) => (
              <li key={key}>
                <a href={NAV_HREFS[key]} className="transition-colors hover:text-gold">
                  {t.nav[key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal links */}
        <nav aria-label="Legal">
          <h3 className={`font-heading text-sm font-bold uppercase tracking-wider text-gold ${hindi}`}>
            {t.footer.legal}
          </h3>
          <ul className={`mt-3 space-y-2 text-sm ${hindi}`}>
            {t.footer.legalLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="transition-colors hover:text-gold">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h3 className={`font-heading text-sm font-bold uppercase tracking-wider text-gold ${hindi}`}>
            {t.footer.contact}
          </h3>
          <p className={`mt-3 text-sm text-soft-white/80 ${hindi}`}>
            {t.footer.contactPending}
          </p>
        </div>
      </Container>

      <div className="border-t border-soft-white/10">
        <Container className="py-4 text-center text-xs text-soft-white/75">
          <p className={hindi}>{t.footer.copyright}</p>
          <p className="mt-1 text-soft-white/70">{site.disclaimer}</p>
        </Container>
      </div>
    </footer>
  );
}
