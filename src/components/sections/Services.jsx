import Container from "../layout/Container";
import SectionHeading from "../ui/SectionHeading";
import { useLanguage } from "../../hooks/useLanguage";

export default function Services() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";

  return (
    <section id="services" className="py-14 sm:py-20" aria-labelledby="services-heading">
      <Container>
        <SectionHeading
          id="services-heading"
          title={t.services.heading}
          note={t.services.note}
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {t.services.items.map((item) => (
            <li
              key={item}
              className={`flex items-start gap-4 rounded-xl border border-navy/10 bg-white p-5 shadow-sm ${hindi}`}
            >
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-royal" aria-hidden="true" />
              <span className="text-sm font-medium leading-relaxed text-navy sm:text-base">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
