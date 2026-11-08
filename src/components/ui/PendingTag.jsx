import { useLanguage } from "../../hooks/useLanguage";

/**
 * Small gold chip used to mark content that is still
 * pending owner verification. Rendered conditionally.
 */
export default function PendingTag({ text }) {
  const { lang } = useLanguage();
  if (!text) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/10 px-3 py-0.5 text-xs font-semibold text-navy ${lang === "hi" ? "font-hindi" : ""}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
      {text}
    </span>
  );
}
