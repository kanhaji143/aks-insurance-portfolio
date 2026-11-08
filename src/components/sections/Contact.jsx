import { useState } from "react";
import Container from "../layout/Container";
import SectionHeading from "../ui/SectionHeading";
import { useLanguage } from "../../hooks/useLanguage";
import site from "../../content/site.json";

/**
 * Contact / Enquiry UI. Prepared but NOT connected to any backend,
 * database or messaging service. Call/WhatsApp buttons render only
 * after site.json contact details are verified.
 */
export default function Contact() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";
  const [submitted, setSubmitted] = useState(false);
  const contact = site.contact;

  function handleSubmit(e) {
    e.preventDefault();
    // No backend connection in this phase — nothing is sent or stored.
    setSubmitted(true);
  }

  return (
    <section id="contact" className="bg-soft-white py-14 sm:py-20" aria-labelledby="contact-heading">
      <Container className="max-w-3xl">
        <SectionHeading id="contact-heading" title={t.contact.heading} note={t.contact.intro} />

        {/* Call / WhatsApp — only after contact details are verified */}
        <div className="mt-8">
          {contact.verified && (contact.phone || contact.whatsapp) ? (
            <div className="flex flex-wrap gap-3">
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className={`inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-soft-white ${hindi}`}
                >
                  {t.contact.callLabel}
                </a>
              )}
              {contact.whatsapp && (
                <a
                  href={`https://wa.me/${contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-lg bg-royal px-5 py-2.5 text-sm font-semibold text-soft-white ${hindi}`}
                >
                  {t.contact.whatsappLabel}
                </a>
              )}
            </div>
          ) : (
            <p className={`rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm font-medium text-navy ${hindi}`} role="note">
              {t.contact.pendingContact}
            </p>
          )}
        </div>

        {/* Enquiry form — UI prepared, inactive by design */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8"
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className={`block text-sm font-semibold text-navy ${hindi}`}>
                {t.contact.form.name}
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1.5 w-full rounded-lg border border-navy/20 bg-soft-white px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40"
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className={`block text-sm font-semibold text-navy ${hindi}`}>
                {t.contact.form.phone}
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="mt-1.5 w-full rounded-lg border border-navy/20 bg-soft-white px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40"
              />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="contact-message" className={`block text-sm font-semibold text-navy ${hindi}`}>
              {t.contact.form.message}
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows="4"
              required
              className="mt-1.5 w-full rounded-lg border border-navy/20 bg-soft-white px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/40"
            />
          </div>

          <button
            type="submit"
            className={`mt-6 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-soft-white transition-colors hover:bg-royal ${hindi}`}
          >
            {t.contact.form.submit}
          </button>

          <p className={`mt-4 text-xs leading-relaxed text-navy/70 ${hindi}`} role="note">
            {submitted ? `${t.contact.form.submit} — ${t.contact.form.inactiveNote}` : t.contact.form.inactiveNote}
          </p>
        </form>
      </Container>
    </section>
  );
}
