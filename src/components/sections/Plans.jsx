import { useEffect, useState } from "react";
import Container from "../layout/Container";
import SectionHeading from "../ui/SectionHeading";
import { EmptyState, ErrorState, LoadingState } from "../ui/SectionStates";
import { useLanguage } from "../../hooks/useLanguage";
import { contentRepository } from "../../services/contentRepository";

/**
 * Public "Insurance Plans" section.
 * Reads only published + verified plans via the content service layer.
 * Company names are resolved from the public companies list; optional
 * fields are rendered only when present. No plan data is invented.
 * Bilingual fields fall back to English when Hindi is missing.
 */
export default function Plans() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";
  const [plans, setPlans] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    Promise.all([contentRepository.getPlans(), contentRepository.getCompanies()])
      .then(([planData, companyData]) => {
        if (cancelled) return;
        setPlans(Array.isArray(planData) ? planData : []);
        setCompanies(Array.isArray(companyData) ? companyData : []);
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

  // Only resolve a company name from the PUBLIC companies list. An orphaned
  // plan (company unpublished/unverified/deleted) never shows a fabricated
  // insurer name.
  const companyName = (id) => {
    if (!id) return "";
    const company = companies.find((c) => c.id === id);
    if (!company) return "";
    return pick(company.nameEn ?? company.name ?? "", company.nameHi ?? "");
  };

  return (
    <section id="plans" className="py-14 sm:py-20" aria-labelledby="plans-heading">
      <Container>
        <SectionHeading
          id="plans-heading"
          title={t.plans.heading}
          note={t.plans.note}
        />

        {loading ? (
          <LoadingState>{t.plans.loading}</LoadingState>
        ) : loadError ? (
          <ErrorState retryLabel={t.plans.retry} onRetry={() => setReloadKey((k) => k + 1)}>
            {t.plans.error}
          </ErrorState>
        ) : plans.length === 0 ? (
          <EmptyState>{t.plans.empty}</EmptyState>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {plans.map((plan) => {
              const name = pick(plan.nameEn ?? plan.name ?? "", plan.nameHi ?? "");
              const description = pick(plan.descriptionEn ?? plan.description ?? "", plan.descriptionHi ?? "");
              const benefits = pick(plan.benefitsEn ?? plan.benefits ?? "", plan.benefitsHi ?? "");
              const eligibility = pick(plan.eligibilityEn ?? plan.eligibility ?? "", plan.eligibilityHi ?? "");
              const insurer = companyName(plan.companyId);
              return (
                <li
                  key={plan.id}
                  className="flex flex-col rounded-xl border border-navy/10 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className={`text-base font-bold leading-snug text-black ${hindi}`}>
                      {name}
                    </h3>
                    {plan.category ? (
                      <span className={`rounded-full bg-soft-white px-2.5 py-0.5 text-xs font-semibold text-navy/70 ${hindi}`}>
                        {t.plans.categories[plan.category] ?? plan.category}
                      </span>
                    ) : null}
                  </div>

                  {insurer ? (
                    <p className={`mt-1 text-xs font-medium text-royal ${hindi}`}>{insurer}</p>
                  ) : null}

                  {description ? (
                    <p className={`mt-3 text-sm leading-relaxed text-navy/70 ${hindi}`}>
                      {description}
                    </p>
                  ) : null}

                  {benefits ? (
                    <div className="mt-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-black">
                        {t.plans.benefitsLabel}
                      </p>
                      <p className={`mt-1 whitespace-pre-line text-sm leading-relaxed text-navy/70 ${hindi}`}>
                        {benefits}
                      </p>
                    </div>
                  ) : null}

                  {eligibility ? (
                    <div className="mt-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-black">
                        {t.plans.eligibilityLabel}
                      </p>
                      <p className={`mt-1 whitespace-pre-line text-sm leading-relaxed text-navy/70 ${hindi}`}>
                        {eligibility}
                      </p>
                    </div>
                  ) : null}

                  {plan.uin ? (
                    <p className="mt-3 text-xs text-navy/60">
                      <span className="font-bold text-black">{t.plans.uinLabel}:</span> {plan.uin}
                    </p>
                  ) : null}

                  {(plan.brochureUrl || plan.officialQuoteUrl) ? (
                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      {plan.brochureUrl ? (
                        <a
                          href={plan.brochureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`rounded-lg border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-soft-white ${hindi}`}
                        >
                          {t.plans.brochureLabel}
                        </a>
                      ) : null}
                      {plan.officialQuoteUrl ? (
                        <a
                          href={plan.officialQuoteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-royal ${hindi}`}
                        >
                          {t.plans.quoteLabel}
                        </a>
                      ) : null}
                    </div>
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
