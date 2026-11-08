import Container from "../layout/Container";
import SectionHeading from "../ui/SectionHeading";
import { useLanguage } from "../../hooks/useLanguage";
import site from "../../content/site.json";

export default function Categories() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";
  const hasCategories = site.insuranceCategories.length > 0;

  return (
    <section id="categories" className="py-14 sm:py-20" aria-labelledby="categories-heading">
      <Container>
        <SectionHeading
          id="categories-heading"
          title={t.categories.heading}
          note={t.categories.note}
        />

        {hasCategories ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {site.insuranceCategories.map((cat) => (
              <li
                key={typeof cat === "string" ? cat : cat.id}
                className={`rounded-xl border border-navy/10 bg-white p-5 text-sm font-medium text-navy shadow-sm ${hindi}`}
              >
                {typeof cat === "string" ? cat : cat.name}
              </li>
            ))}
          </ul>
        ) : (
          <div
            className={`mt-10 rounded-2xl border-2 border-dashed border-navy/20 bg-white p-10 text-center text-sm leading-relaxed text-navy/70 sm:text-base ${hindi}`}
            role="note"
          >
            {t.categories.empty}
          </div>
        )}
      </Container>
    </section>
  );
}
