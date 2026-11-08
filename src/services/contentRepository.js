/**
 * Content Service Layer (interface) + Repository Layer.
 *
 * Public UI components call only this module — never Firestore queries
 * directly. Reads published+verified content from Firestore, which is the
 * source of truth. The JSON seed is used only when Firebase is not
 * configured at all (local development/demo); when Firestore is configured,
 * empty results show the empty state and read failures propagate to the UI
 * so it can show a proper error state instead of stale JSON content.
 */
import site from "../content/site.json";
import en from "../content/en.json";
import hi from "../content/hi.json";
import calculators from "../content/calculators.json";
import videos from "../content/videos.json";

import { getDb } from "./firebaseAdapter";

// Firebase Firestore helpers are imported dynamically (see methods below)
// so the SDK stays out of the initial bundle when unused.

// Firestore document shape (Phase 6):
// companies:        nameEn, nameHi, descriptionEn, descriptionHi,
//                   websiteUrl, logoUrl, isVerified, isPublished,
//                   displayOrder, createdAt, updatedAt
//                   (legacy name/description kept for backward compatibility)
// insurancePlans:   nameEn, nameHi, descriptionEn, descriptionHi,
//                   benefitsEn, benefitsHi, eligibilityEn, eligibilityHi,
//                   companyId, category, brochureUrl, officialQuoteUrl, uin,
//                   isVerified, isPublished, displayOrder
//                   (legacy name/description/benefits/eligibility kept)
// calculatorLinks:  companyId, labelEn, labelHi, category, url,
//                   isVerified, isPublished, displayOrder
// videos:           youtubeVideoId, titleEn, titleHi, descriptionEn,
//                   descriptionHi, isVerified, isPublished, displayOrder
// siteSettings/public: advisor profile, contact, serviceArea, languages, meta

const seedCalculatorLinks = () =>
  calculators.links
    .filter((l) => l.enabled && l.url)
    .map((l) => ({
      id: null,
      companyId: l.companyId ?? null,
      labelEn: l.labelEn,
      labelHi: l.labelHi,
      url: l.url,
      isPublished: true,
      isVerified: true,
      displayOrder: l.displayOrder ?? 99,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

const byDisplayOrder = (a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99);

const seedVideos = () =>
  videos.videos
    .filter((v) => v.isPublished && v.id)
    .map((v) => ({
      id: null,
      youtubeVideoId: v.id,
      titleEn: v.titleEn,
      titleHi: v.titleHi,
      descriptionEn: v.descriptionEn ?? "",
      descriptionHi: v.descriptionHi ?? "",
      isPublished: true,
      isVerified: true,
      displayOrder: v.displayOrder ?? 99,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

export const contentRepository = {
  /**
   * Returns published + verified insurance companies.
   * Uses equality-only filters (no orderBy) so no composite index is
   * required; ordering is applied in memory.
   *
   * Firestore is the source of truth in production. Errors propagate to
   * the UI so it can show a proper error state instead of silently
   * rendering stale JSON seed content.
   */
  async getCompanies() {
    const db = await getDb();
    // JSON seed / demo mode only: no Firebase config in this environment.
    if (!db) return [];
    const { collection, query, where, getDocs } = await import("firebase/firestore");
    const q = query(
      collection(db, "companies"),
      where("isPublished", "==", true),
      where("isVerified", "==", true),
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((c) => c.isPublished === true && c.isVerified === true)
      .sort(byDisplayOrder);
  },

  /**
   * Returns published + verified insurance plans.
   * Same equality-only strategy as companies (no composite index needed).
   * Errors propagate to the UI.
   */
  async getPlans() {
    const db = await getDb();
    if (!db) return [];
    const { collection, query, where, getDocs } = await import("firebase/firestore");
    const q = query(
      collection(db, "insurancePlans"),
      where("isPublished", "==", true),
      where("isVerified", "==", true),
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => p.isPublished === true && p.isVerified === true)
      .sort(byDisplayOrder);
  },

  /**
   * Returns all official calculator links that may be shown publicly.
   * Only published + verified entries are ever returned.
   *
   * Firestore is the source of truth. An empty Firestore result is an
   * empty list (the UI shows the empty state). The JSON seed is used only
   * when Firebase is not configured at all (local demo).
   */
  async getCalculatorLinks() {
    const db = await getDb();
    if (!db) return seedCalculatorLinks();
    const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore");
    const q = query(
      collection(db, "calculatorLinks"),
      where("isPublished", "==", true),
      where("isVerified", "==", true),
      orderBy("displayOrder", "asc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /**
   * Returns published+verified YouTube videos for the Knowledge Centre.
   * Firestore is the source of truth; the JSON seed is only a local-demo
   * fallback when Firebase is not configured.
   */
  async getVideos() {
    const db = await getDb();
    if (!db) return seedVideos();
    const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore");
    const q = query(
      collection(db, "videos"),
      where("isPublished", "==", true),
      where("isVerified", "==", true),
      orderBy("displayOrder", "asc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        youtubeVideoId: data.youtubeVideoId ?? data.id ?? null,
        titleEn: data.titleEn ?? "",
        titleHi: data.titleHi ?? "",
        descriptionEn: data.descriptionEn ?? "",
        descriptionHi: data.descriptionHi ?? "",
        isPublished: data.isPublished === true,
        isVerified: data.isVerified === true,
        displayOrder: data.displayOrder ?? 99,
      };
    });
  },

  /** Static site settings (brand, taglines, areas). Firestore later. */
  async getSiteSettings() {
    const db = await getDb();
    if (db) {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "siteSettings", "public"));
        if (snap.exists()) {
          const data = snap.data();
          if (data.isPublished === true) {
            return { ...site, ...data };
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[contentRepository] siteSettings Firestore read failed, using seed:", err?.message);
      }
    }
    return { ...site };
  },

  /** Static UI copy for a language. Firestore later if needed. */
  async getTranslations(lang) {
    return lang === "hi" ? { ...hi } : { ...en };
  },
};