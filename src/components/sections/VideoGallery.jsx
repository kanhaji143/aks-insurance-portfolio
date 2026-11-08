import Container from "../layout/Container";
import SectionHeading from "../ui/SectionHeading";
import { EmptyState, ErrorState, LoadingState } from "../ui/SectionStates";
import { useLanguage } from "../../hooks/useLanguage";
import { contentRepository } from "../../services/contentRepository";
import { useEffect, useState } from "react";

/**
 * Knowledge Centre. Videos are embedded ONLY from owner-verified
 * YouTube IDs (published+verified entries), using the privacy-enhanced
 * youtube-nocookie.com domain. Sourced via the content service layer
 * (Firestore is the source of truth; JSON seed is local-demo only).
 */
export default function VideoGallery() {
  const { t, lang } = useLanguage();
  const hindi = lang === "hi" ? "font-hindi" : "";
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    contentRepository
      .getVideos()
      .then((data) => {
        if (!cancelled) setVideos(Array.isArray(data) ? data : []);
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

  const published = videos
    .filter((v) => v.isPublished && v.youtubeVideoId)
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));

  return (
    <section id="videos" className="py-14 sm:py-20" aria-labelledby="videos-heading">
      <Container>
        <SectionHeading
          id="videos-heading"
          title={t.videos.heading}
          note={t.videos.note}
        />

        {loading ? (
          <LoadingState>{t.videos.loading}</LoadingState>
        ) : loadError ? (
          <ErrorState retryLabel={t.videos.retry} onRetry={() => setReloadKey((k) => k + 1)}>
            {t.videos.error}
          </ErrorState>
        ) : published.length === 0 ? (
          <EmptyState>{t.videos.empty}</EmptyState>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2" role="list">
            {published.map((video) => (
              <li key={video.youtubeVideoId} className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}`}
                    title={lang === "hi" ? video.titleHi || video.titleEn : video.titleEn}
                    className="h-full w-full"
                    loading="lazy"
                    allow="encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className={`p-4 text-sm font-semibold text-navy ${hindi}`}>
                  {lang === "hi" ? video.titleHi || video.titleEn : video.titleEn}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
