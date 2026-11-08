import Container from "../layout/Container";
import { useLanguage } from "../../hooks/useLanguage";

const SEGMENTS = [
  { id: "individual", accent: "bg-royal" },
  { id: "corporate", accent: "bg-gold" },
];

export default function Segments() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";

  return (
    <div>
      {SEGMENTS.map((seg) => (
        <section
          key={seg.id}
          id={seg.id}
          className={seg.id === "corporate" ? "py-14 sm:py-20" : "py-14 sm:py-20"}
          aria-labelledby={`${seg.id}-title`}
        >
          <Container>
            <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
              <div className={`h-1.5 w-full ${seg.accent}`} aria-hidden="true" />
              <div className="p-8 sm:p-10">
                <h2
                  id={`${seg.id}-title`}
                  className={`font-heading text-xl font-bold text-navy sm:text-2xl ${hindi}`}
                >
                  {t[seg.id].heading}
                </h2>
                <p className={`mt-4 max-w-3xl text-sm leading-relaxed text-navy/75 sm:text-base ${hindi}`}>
                  {t[seg.id].body}
                </p>
                <p className={`mt-4 inline-flex rounded-full bg-soft-white px-3 py-1 text-xs font-semibold text-navy/60 ${hindi}`} role="note">
                  {t[seg.id].note}
                </p>
              </div>
            </div>
          </Container>
        </section>
      ))}
    </div>
  );
}
