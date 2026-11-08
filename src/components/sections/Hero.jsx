import Container from "../layout/Container";
import { useLanguage } from "../../hooks/useLanguage";
import site from "../../content/site.json";

export default function Hero() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";

  return (
    <section id="home" className="bg-navy text-soft-white" aria-labelledby="hero-heading">
      <Container className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Copy */}
        <div>
          <p className={`inline-block rounded-full border border-gold px-4 py-1 text-xs font-semibold tracking-wide text-gold sm:text-sm ${hindi}`}>
            {t.hero.badge}
          </p>
          <h1 id="hero-heading" className={`mt-5 font-heading text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl ${hindi}`}>
            {site.brand.tagline[lang]}
          </h1>
          <p className={`mt-4 text-base leading-relaxed text-soft-white/85 sm:text-lg ${hindi}`}>
            {t.hero.otherTagline}
          </p>
          <p className={`mt-5 text-sm text-soft-white/80 sm:text-base ${hindi}`}>
            {t.hero.experienceLine}
          </p>

          {/* CTAs — internal anchors only; no backend dependency */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact"
              className={`rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-gold/85 ${hindi}`}
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#calculators"
              className={`rounded-lg border border-soft-white/40 px-6 py-3 text-sm font-semibold text-soft-white transition-colors hover:border-gold hover:text-gold ${hindi}`}
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>

        {/* Advisor photo — clearly marked placeholder until owner supplies the real photo */}
        <div className="justify-self-center lg:justify-self-end">
          <img
            src={site.photo.src}
            alt={t.hero.photoAlt}
            className="w-56 rounded-xl shadow-xl sm:w-72 lg:w-80"
          />
        </div>
      </Container>
    </section>
  );
}
