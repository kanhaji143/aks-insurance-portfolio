import { useEffect, useState } from "react";
import Container from "../layout/Container";
import SectionHeading from "../ui/SectionHeading";
import { EmptyState, ErrorState, LoadingState } from "../ui/SectionStates";
import { useLanguage } from "../../hooks/useLanguage";
import { contentRepository } from "../../services/contentRepository";

/**
 * Public "Insurance Companies" section.
 * Reads only published + verified companies via the content service layer.
 * Bilingual fields fall back to English when Hindi is missing.
 * Firestore is the source of truth; errors are surfaced to the visitor.
 */

function CompanyLogo({ src, name }) {
  const [failed, setFailed] = useState(false);
  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const box =
    "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-navy/10 bg-soft-white p-1.5";

  if (!src || failed) {
    return (
      <div className={`${box} font-heading text-lg font-bold text-royal`} aria-hidden="true">
        {initial}
      </div>
    );
  }

  return (
    <div className={box}>
      <img
        src={src}
        alt=""
        className="max-h-full max-w-full object-contain"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function Companies() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    contentRepository
      .getCompanies()
      .then((data) => {
        if (!cancelled) setCompanies(Array.isArray(data) ? data : []);
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

  const pick = (english, hindiText) => (lang === "hi" ? hindiText || english : english);

  return (
    <section id="companies" className="py-14 sm:py-20" aria-labelledby="companies-heading">
      <Container>
        <SectionHeading
          id="companies-heading"
          title={t.companies.heading}
          note={t.companies.note}
        />

        {loading ? (
          <LoadingState>{t.companies.loading}</LoadingState>
        ) : loadError ? (
          <ErrorState retryLabel={t.companies.retry} onRetry={() => setReloadKey((k) => k + 1)}>
            {t.companies.error}
          </ErrorState>
        ) : companies.length === 0 ? (
          <EmptyState>{t.companies.empty}</EmptyState>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {companies.map((company) => {
              const nameEn = company.nameEn ?? company.name ?? "";
              const descriptionEn = company.descriptionEn ?? company.description ?? "";
              const name = pick(nameEn, company.nameHi ?? "");
              const description = pick(descriptionEn, company.descriptionHi ?? "");
              return (
                <li
                  key={company.id}
                  className="flex flex-col rounded-xl border border-navy/10 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <CompanyLogo src={company.logoUrl} name={name} />
                    <h3 className={`text-base font-semibold leading-snug text-navy ${hindi}`}>
                      {name}
                    </h3>
                  </div>

                  {description ? (
                    <p className={`mt-3 line-clamp-5 whitespace-pre-line text-sm leading-relaxed text-navy/70 ${hindi}`}>
                      {description}
                    </p>
                  ) : null}

                  {company.websiteUrl ? (
                    <a
                      href={company.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-royal transition-colors hover:text-navy ${hindi}`}
                    >
                      {t.companies.websiteLabel}
                      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
                        <path d="M11 3h6v6h-2V6.41l-7.29 7.3-1.42-1.42 7.3-7.29H11V3ZM5 5h4V3H3v14h14v-6h-2v4H5V5Z" />
                      </svg>
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
