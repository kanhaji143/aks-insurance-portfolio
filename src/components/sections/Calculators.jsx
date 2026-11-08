import Container from "../layout/Container";
import SectionHeading from "../ui/SectionHeading";
import { EmptyState, ErrorState, LoadingState } from "../ui/SectionStates";
import { useLanguage } from "../../hooks/useLanguage";
import { contentRepository } from "../../services/contentRepository";
import { useEffect, useState } from "react";

/**
 * Renders ONLY official, owner-verified insurer calculator links.
 * Sourced via the content service layer (Firestore published+verified
 * entries; JSON seed is used only for local demo when Firebase is not
 * configured). Links without a URL are never displayed.
 * No premium is calculated on this website.
 */
export default function Calculators() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    contentRepository
      .getCalculatorLinks()
      .then((data) => {
        if (!cancelled) setLinks(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const enabledLinks = links.filter((l) => l.url);

  return (
    <section id="calculators" className="py-14 sm:py-20" aria-labelledby="calculators-heading">
      <Container>
        <SectionHeading
          id="calculators-heading"
          title={t.calculators.heading}
          note={t.calculators.note}
        />

        {loading ? (
          <LoadingState>{t.calculators.loading}</LoadingState>
        ) : loadError ? (
          <ErrorState retryLabel={t.calculators.retry} onRetry={() => setReloadKey((k) => k + 1)}>
            {t.calculators.error}
          </ErrorState>
        ) : enabledLinks.length === 0 ? (
          <EmptyState>{t.calculators.empty}</EmptyState>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {enabledLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-navy/10 bg-white p-5 shadow-sm transition-colors hover:border-royal/40 hover:bg-soft-white"
                >
                  <span className={`text-sm font-semibold text-navy ${hindi}`}>
                    {lang === "hi" ? link.labelHi || link.labelEn : link.labelEn}
                  </span>
                  <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-royal" fill="currentColor" aria-hidden="true">
                    <path d="M11 3h6v6h-2V6.41l-7.29 7.3-1.42-1.42 7.3-7.29H11V3ZM5 5h4V3H3v14h14v-6h-2v4H5V5Z" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
