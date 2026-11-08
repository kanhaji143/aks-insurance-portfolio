import { useState } from "react";
import Container from "../layout/Container";
import SectionHeading from "../ui/SectionHeading";
import { useLanguage } from "../../hooks/useLanguage";

export default function Faq() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-14 sm:py-20" aria-labelledby="faq-heading">
      <Container className="max-w-3xl">
        <SectionHeading id="faq-heading" title={t.faq.heading} />

        <div className="mt-8 space-y-3">
          {t.faq.items.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.q} className="rounded-xl border border-navy/10 bg-white shadow-sm">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    className={`flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-semibold text-navy sm:text-base ${hindi}`}
                  >
                    <span>{faq.q}</span>
                    <span aria-hidden="true" className={`shrink-0 text-lg font-bold text-gold ${isOpen ? "" : "rotate-45"}`}>
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-button-${i}`}
                  className={`px-5 pb-5 text-sm leading-relaxed text-navy/70 sm:text-base ${hindi}`}
                  hidden={!isOpen}
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
