import { useLanguage } from "../../hooks/useLanguage";

/**
 * Shared public-section status blocks.
 * Keeps loading, empty and error states visually consistent across
 * Companies, Plans, Calculators and Videos.
 */

const hindiClass = (lang) => (lang === "hi" ? "font-hindi" : "");

export function LoadingState({ children }) {
  const { lang } = useLanguage();
  return (
    <div
      className={`mt-10 rounded-2xl border border-navy/10 bg-white p-10 text-center text-sm text-navy/70 ${hindiClass(lang)}`}
      role="status"
    >
      {children}
    </div>
  );
}

export function EmptyState({ children }) {
  const { lang } = useLanguage();
  return (
    <div
      className={`mt-10 rounded-2xl border-2 border-dashed border-navy/20 bg-white p-10 text-center text-sm leading-relaxed text-navy/70 sm:text-base ${hindiClass(lang)}`}
      role="note"
    >
      {children}
    </div>
  );
}

export function ErrorState({ children, retryLabel, onRetry }) {
  const { lang } = useLanguage();
  return (
    <div
      className={`mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm leading-relaxed text-red-700 ${hindiClass(lang)}`}
      role="alert"
    >
      <p>{children}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-royal"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
