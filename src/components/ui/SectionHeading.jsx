import { useLanguage } from "../../hooks/useLanguage";

/**
 * Shared section heading block with a gold accent rule
 * and an optional supporting note line.
 */
export default function SectionHeading({ id, title, note, align = "left" }) {
  const { lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";

  return (
    <div id={id} className={align === "center" ? "text-center" : ""}>
      <h2 className={`font-heading text-2xl font-bold text-navy sm:text-3xl ${hindi}`}>
        {title}
      </h2>
      <div
        className={`mt-3 h-1 w-12 rounded-full bg-gold ${align === "center" ? "mx-auto" : ""}`}
        aria-hidden="true"
      />
      {note && (
        <p className={`mt-4 max-w-3xl text-sm leading-relaxed text-navy/70 sm:text-base ${hindi} ${align === "center" ? "mx-auto" : ""}`}>
          {note}
        </p>
      )}
    </div>
  );
}
