/**
 * Admin Repository — Firestore CRUD for the Admin Panel (Phase 4).
 *
 * All Firestore access for admin operations lives here, never in UI.
 * Reads/writes go through Firestore Security Rules (admin UID allowlist).
 * Timestamps use serverTimestamp(); validation stays in the UI layer.
 */
import { getDb } from "./firebaseAdapter";
import { companyDeleteDependencyMessage } from "./validation";

const now = () => null; // placeholder; use serverTimestamp at call site

async function fs() {
  return import("firebase/firestore");
}

export const adminRepository = {
  // ---------- companies ----------
  async listCompanies() {
    const db = await getDb();
    const { collection, getDocs, orderBy, query } = await fs();
    const snap = await getDocs(query(collection(db, "companies"), orderBy("displayOrder", "asc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async createCompany(data) {
    const db = await getDb();
    const { collection, addDoc, serverTimestamp } = await fs();
    const ref = await addDoc(collection(db, "companies"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },
  async updateCompany(id, data) {
    const db = await getDb();
    const { doc, updateDoc, serverTimestamp } = await fs();
    await updateDoc(doc(db, "companies", id), { ...data, updatedAt: serverTimestamp() });
  },
  async deleteCompany(id) {
    const db = await getDb();
    const { collection, doc, deleteDoc, getDocs, query, where } = await fs();
    // Referential integrity: never delete a company that other records still
    // point at. Dependent records are never modified or deleted automatically.
    const [plans, links] = await Promise.all([
      getDocs(query(collection(db, "insurancePlans"), where("companyId", "==", id))),
      getDocs(query(collection(db, "calculatorLinks"), where("companyId", "==", id))),
    ]);
    const detail = companyDeleteDependencyMessage({ plans: plans.size, links: links.size });
    if (detail) {
      throw new Error(
        `Cannot delete this company: ${detail}. ` +
          "Delete or reassign those records first. No data was changed.",
      );
    }
    await deleteDoc(doc(db, "companies", id));
  },
  async countPlansByCompany(companyId) {
    if (!companyId) return 0;
    const db = await getDb();
    const { collection, getDocs, query, where } = await fs();
    // Equality-only query: uses the automatic single-field index.
    const snap = await getDocs(
      query(collection(db, "insurancePlans"), where("companyId", "==", companyId)),
    );
    return snap.size;
  },
  async countCalculatorLinksByCompany(companyId) {
    if (!companyId) return 0;
    const db = await getDb();
    const { collection, getDocs, query, where } = await fs();
    // Equality-only query: uses the automatic single-field index.
    const snap = await getDocs(
      query(collection(db, "calculatorLinks"), where("companyId", "==", companyId)),
    );
    return snap.size;
  },
  async setCompanyPublished(id, isPublished) {
    const db = await getDb();
    const { doc, updateDoc, serverTimestamp } = await fs();
    await updateDoc(doc(db, "companies", id), { isPublished, updatedAt: serverTimestamp() });
  },
  async setCompanyVerified(id, isVerified) {
    const db = await getDb();
    const { doc, updateDoc, serverTimestamp } = await fs();
    await updateDoc(doc(db, "companies", id), { isVerified, updatedAt: serverTimestamp() });
  },

  // ---------- insurancePlans ----------
  async listPlans() {
    const db = await getDb();
    const { collection, getDocs, orderBy, query } = await fs();
    const snap = await getDocs(query(collection(db, "insurancePlans"), orderBy("displayOrder", "asc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async createPlan(data) {
    const db = await getDb();
    const { collection, addDoc, serverTimestamp } = await fs();
    const ref = await addDoc(collection(db, "insurancePlans"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },
  async updatePlan(id, data) {
    const db = await getDb();
    const { doc, updateDoc, serverTimestamp } = await fs();
    await updateDoc(doc(db, "insurancePlans", id), { ...data, updatedAt: serverTimestamp() });
  },
  async deletePlan(id) {
    const db = await getDb();
    const { doc, deleteDoc } = await fs();
    await deleteDoc(doc(db, "insurancePlans", id));
  },
  async setPlanPublished(id, isPublished) {
    const db = await getDb();
    const { doc, updateDoc, serverTimestamp } = await fs();
    await updateDoc(doc(db, "insurancePlans", id), { isPublished, updatedAt: serverTimestamp() });
  },
  async setPlanVerified(id, isVerified) {
    const db = await getDb();
    const { doc, updateDoc, serverTimestamp } = await fs();
    await updateDoc(doc(db, "insurancePlans", id), { isVerified, updatedAt: serverTimestamp() });
  },

  // ---------- calculatorLinks ----------
  async listCalculatorLinks() {
    const db = await getDb();
    const { collection, getDocs, orderBy, query } = await fs();
    const snap = await getDocs(query(collection(db, "calculatorLinks"), orderBy("displayOrder", "asc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async createCalculatorLink(data) {
    const db = await getDb();
    const { collection, addDoc, serverTimestamp } = await fs();
    const ref = await addDoc(collection(db, "calculatorLinks"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },
  async updateCalculatorLink(id, data) {
    const db = await getDb();
    const { doc, updateDoc, serverTimestamp } = await fs();
    await updateDoc(doc(db, "calculatorLinks", id), { ...data, updatedAt: serverTimestamp() });
  },
  async deleteCalculatorLink(id) {
    const db = await getDb();
    const { doc, deleteDoc } = await fs();
    await deleteDoc(doc(db, "calculatorLinks", id));
  },
  async setCalculatorLinkPublished(id, isPublished) {
    const db = await getDb();
    const { doc, updateDoc, serverTimestamp } = await fs();
    await updateDoc(doc(db, "calculatorLinks", id), { isPublished, updatedAt: serverTimestamp() });
  },
  async setCalculatorLinkVerified(id, isVerified) {
    const db = await getDb();
    const { doc, updateDoc, serverTimestamp } = await fs();
    await updateDoc(doc(db, "calculatorLinks", id), { isVerified, updatedAt: serverTimestamp() });
  },

  // ---------- videos ----------
  async listVideos() {
    const db = await getDb();
    const { collection, getDocs, orderBy, query } = await fs();
    const snap = await getDocs(query(collection(db, "videos"), orderBy("displayOrder", "asc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async createVideo(data) {
    const db = await getDb();
    const { collection, addDoc, serverTimestamp } = await fs();
    const ref = await addDoc(collection(db, "videos"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },
  async updateVideo(id, data) {
    const db = await getDb();
    const { doc, updateDoc, serverTimestamp } = await fs();
    await updateDoc(doc(db, "videos", id), { ...data, updatedAt: serverTimestamp() });
  },
  async deleteVideo(id) {
    const db = await getDb();
    const { doc, deleteDoc } = await fs();
    await deleteDoc(doc(db, "videos", id));
  },
  async setVideoPublished(id, isPublished) {
    const db = await getDb();
    const { doc, updateDoc, serverTimestamp } = await fs();
    await updateDoc(doc(db, "videos", id), { isPublished, updatedAt: serverTimestamp() });
  },
  async setVideoVerified(id, isVerified) {
    const db = await getDb();
    const { doc, updateDoc, serverTimestamp } = await fs();
    await updateDoc(doc(db, "videos", id), { isVerified, updatedAt: serverTimestamp() });
  },

  // ---------- dashboard counts ----------
  async getDashboardStats() {
    const db = await getDb();
    const { collection, getDocs } = await fs();
    const [companies, plans, links, videos] = await Promise.all([
      getDocs(collection(db, "companies")),
      getDocs(collection(db, "insurancePlans")),
      getDocs(collection(db, "calculatorLinks")),
      getDocs(collection(db, "videos")),
    ]);
    const countPublished = (snap) => snap.docs.filter((d) => d.data().isPublished === true).length;
    return {
      companies: companies.size,
      plans: plans.size,
      links: links.size,
      videos: videos.size,
      publishedCompanies: countPublished(companies),
      publishedPlans: countPublished(plans),
      publishedLinks: countPublished(links),
      publishedVideos: countPublished(videos),
    };
  },
};