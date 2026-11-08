import Container from "../layout/Container";
import SectionHeading from "../ui/SectionHeading";
import PendingTag from "../ui/PendingTag";
import { useLanguage } from "../../hooks/useLanguage";
import site from "../../content/site.json";

export default function Experience() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";

  const areas = [
    ...site.serviceArea.primary,
    site.serviceArea.region,
  ];

  return (
    <section id="experience" className="py-14 sm:py-20">
      <Container>
        <SectionHeading
          id="experience-heading"
          title={t.experience.heading}
          note={t.experience.lead}
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Experience stat card */}
          <div className="rounded-2xl border border-navy/10 bg-white p-8 text-center shadow-sm">
            <p className="font-heading text-5xl font-extrabold text-royal sm:text-6xl">
              {site.experience.years}+
            </p>
            <p className={`mt-2 font-heading text-lg font-semibold text-navy ${hindi}`}>
              {t.experience.yearsLabel}
            </p>
            <div className="mt-3 flex justify-center">
              {!site.experience.verified && <PendingTag text={t.experience.pendingTag} />}
            </div>
          </div>

          {/* Service area card */}
          <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
            <h3 className={`font-heading text-lg font-bold text-navy ${hindi}`}>
              {t.experience.areasHeading}
            </h3>
            <ul className={`mt-4 space-y-3 text-sm sm:text-base ${hindi}`} role="list">
              {areas.map((area) => (
                <li key={area} className="flex items-center gap-3 text-navy/80">
                  <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
