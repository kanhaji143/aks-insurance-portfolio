import Container from "../layout/Container";
import PendingTag from "../ui/PendingTag";
import { useLanguage } from "../../hooks/useLanguage";
import site from "../../content/site.json";

export default function About() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";

  return (
    <section id="about" className="bg-navy py-14 text-soft-white sm:py-20" aria-labelledby="about-heading">
      <Container className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Photo — placeholder until owner supplies an approved image */}
        <div className="justify-self-center lg:justify-self-start">
          <img
            src={site.photo.src}
            alt={site.photo.placeholder ? t.hero.photoAlt : site.brand.name}
            className="w-56 rounded-xl shadow-xl sm:w-64"
          />
        </div>

        {/* Copy */}
        <div id="about-heading" role="heading" aria-level="2">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            {t.about.heading}
          </h2>
          <p className={`mt-4 text-sm leading-relaxed text-soft-white/85 sm:text-base ${hindi}`}>
            {t.about.intro}
          </p>
          <p className={`mt-3 text-sm leading-relaxed text-soft-white/70 sm:text-base ${hindi}`}>
            {t.about.bioPlaceholder}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-royal px-4 py-1.5 text-sm font-semibold">
              {site.experience.years}+ {t.experience.yearsLabel}
            </span>
            {!site.experience.verified && (
              <span className={`rounded-full border border-gold/60 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold ${hindi}`}>
                {t.about.pendingTag}
              </span>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
