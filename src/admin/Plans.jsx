import { useEffect, useState } from "react";
import { adminRepository } from "../services/adminRepository";
import { describeFirestoreError } from "../services/validation";
import { Alert, Button, FormField, Input, Modal, Select, StatusBadge, Textarea, useConfirm } from "./ui";

const CATEGORIES = ["Life", "Health", "Motor", "Travel", "Other"];

const emptyForm = {
  nameEn: "",
  nameHi: "",
  companyId: "",
  category: "Life",
  descriptionEn: "",
  descriptionHi: "",
  benefitsEn: "",
  benefitsHi: "",
  eligibilityEn: "",
  eligibilityHi: "",
  brochureUrl: "",
  officialQuoteUrl: "",
  uin: "",
  isVerified: false,
  isPublished: false,
  displayOrder: 99,
};

export default function Plans() {
  const [items, setItems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { confirm, dialog } = useConfirm();

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [ps, cs] = await Promise.all([adminRepository.listPlans(), adminRepository.listCompanies()]);
      setItems(ps);
      setCompanies(cs);
    } catch (e) {
      setError(describeFirestoreError(e, "Failed to load plans."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, companyId: companies[0]?.id ?? "" });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      nameEn: item.nameEn ?? item.name ?? "",
      nameHi: item.nameHi ?? "",
      companyId: item.companyId ?? "",
      category: item.category ?? "Life",
      descriptionEn: item.descriptionEn ?? item.description ?? "",
      descriptionHi: item.descriptionHi ?? "",
      benefitsEn: item.benefitsEn ?? item.benefits ?? "",
      benefitsHi: item.benefitsHi ?? "",
      eligibilityEn: item.eligibilityEn ?? item.eligibility ?? "",
      eligibilityHi: item.eligibilityHi ?? "",
      brochureUrl: item.brochureUrl ?? "",
      officialQuoteUrl: item.officialQuoteUrl ?? "",
      uin: item.uin ?? "",
      isVerified: item.isVerified === true,
      isPublished: item.isPublished === true,
      displayOrder: item.displayOrder ?? 99,
    });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setFormError("");
  }

  function validUrl(v) {
    if (!v) return true;
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    // Validation errors stay inside the modal and keep the typed values.
    if (!form.nameEn.trim()) {
      setFormError("Plan name (English) is required.");
      return;
    }
    if (!form.companyId) {
      setFormError("Please select a company.");
      return;
    }
    if (!companies.some((c) => c.id === form.companyId)) {
      setFormError("The selected company no longer exists. Please choose another company.");
      return;
    }
    if (!validUrl(form.brochureUrl) || !validUrl(form.officialQuoteUrl)) {
      setFormError("Brochure and Official Quote URLs must be valid URLs (including https://).");
      return;
    }
    setSaving(true);
    setFormError("");
    setNotice("");
    try {
      const nameEn = form.nameEn.trim();
      const nameHi = form.nameHi.trim();
      const descriptionEn = form.descriptionEn.trim();
      const descriptionHi = form.descriptionHi.trim();
      const benefitsEn = form.benefitsEn.trim();
      const benefitsHi = form.benefitsHi.trim();
      const eligibilityEn = form.eligibilityEn.trim();
      const eligibilityHi = form.eligibilityHi.trim();
      const payload = {
        // New bilingual fields
        nameEn,
        nameHi,
        descriptionEn,
        descriptionHi,
        benefitsEn,
        benefitsHi,
        eligibilityEn,
        eligibilityHi,
        // Legacy mirrors kept for backward compatibility (not deleted).
        name: nameEn,
        description: descriptionEn,
        benefits: benefitsEn,
        eligibility: eligibilityEn,
        companyId: form.companyId,
        category: form.category,
        brochureUrl: form.brochureUrl.trim(),
        officialQuoteUrl: form.officialQuoteUrl.trim(),
        uin: form.uin.trim(),
        isVerified: form.isVerified,
        isPublished: form.isPublished,
        displayOrder: Number(form.displayOrder) || 99,
      };
      if (editing) {
        await adminRepository.updatePlan(editing.id, payload);
      } else {
        await adminRepository.createPlan(payload);
      }
      setModalOpen(false);
      setNotice(`Plan "${nameEn}" ${editing ? "updated" : "added"} successfully.`);
      await load();
    } catch (e) {
      setFormError(describeFirestoreError(e, "Could not save the plan. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  const displayName = (item) => item.nameEn ?? item.name ?? "";

  async function handleDelete(item) {
    setError("");
    setNotice("");
    const ok = await confirm(
      `Delete plan "${displayName(item)}"? This cannot be undone.`,
      { confirmLabel: "Delete plan", variant: "danger" },
    );
    if (!ok) return;
    try {
      await adminRepository.deletePlan(item.id);
      setNotice(`Plan "${displayName(item)}" deleted.`);
      await load();
    } catch (e) {
      setError(describeFirestoreError(e, "Delete failed. Nothing was deleted."));
    }
  }

  async function togglePublished(item) {
    const next = !item.isPublished;
    const ok = await confirm(
      next
        ? `Publish plan "${displayName(item)}"? It will appear on the public website only when it is also Verified.`
        : `Unpublish plan "${displayName(item)}"? It will be hidden from the public website immediately.`,
      { confirmLabel: next ? "Publish" : "Unpublish", variant: next ? "primary" : "danger" },
    );
    if (!ok) return;
    setError("");
    setNotice("");
    try {
      await adminRepository.setPlanPublished(item.id, next);
      setNotice(`Plan "${displayName(item)}" ${next ? "published" : "unpublished"}.`);
      await load();
    } catch (e) {
      setError(describeFirestoreError(e, "Update failed."));
    }
  }

  async function toggleVerified(item) {
    const next = !item.isVerified;
    const ok = await confirm(
      next
        ? `Mark plan "${displayName(item)}" as Verified? Combined with Published, this makes it visible on the public website.`
        : `Remove verification from "${displayName(item)}"? It will be hidden from the public website immediately.`,
      { confirmLabel: next ? "Mark verified" : "Remove verification", variant: next ? "primary" : "danger" },
    );
    if (!ok) return;
    setError("");
    setNotice("");
    try {
      await adminRepository.setPlanVerified(item.id, next);
      setNotice(`Plan "${displayName(item)}" ${next ? "verified" : "unverified"}.`);
      await load();
    } catch (e) {
      setError(describeFirestoreError(e, "Update failed."));
    }
  }

  const companyName = (id) => {
    const company = id ? companies.find((c) => c.id === id) : null;
    return company ? (company.nameEn ?? company.name ?? id) : "—";
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Insurance Plans</h1>
        <Button onClick={openCreate} disabled={companies.length === 0}>+ Add Plan</Button>
      </div>
      {companies.length === 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Add at least one Company before creating plans.
        </div>
      )}
      {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      {notice && <Alert tone="success" className="mt-4">{notice}</Alert>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
        {loading ? (
          <div className="p-6 text-sm text-navy/70">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-navy/70">No plans yet.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-soft-white text-left text-navy/70">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-navy/5">
                  <td className="px-4 py-3 font-medium text-navy">{displayName(item)}</td>
                  <td className="px-4 py-3 text-navy/70">{companyName(item.companyId)}</td>
                  <td className="px-4 py-3 text-navy/70">{item.category}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleVerified(item)}>
                      <StatusBadge value={item.isVerified} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublished(item)}>
                      <StatusBadge value={item.isPublished} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => openEdit(item)}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDelete(item)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? "Edit Plan" : "Add Plan"} onClose={closeModal} width="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <Alert tone="error">{formError}</Alert>}
          <FormField label="Name (English) *">
            <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
          </FormField>
          <FormField label="Name (Hindi)">
            <Input value={form.nameHi} onChange={(e) => setForm({ ...form, nameHi: e.target.value })} />
          </FormField>
          <FormField label="Company *">
            <Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
              <option value="">— Select —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.nameEn ?? c.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Description (English)">
            <Textarea rows={3} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          </FormField>
          <FormField label="Description (Hindi)">
            <Textarea rows={3} value={form.descriptionHi} onChange={(e) => setForm({ ...form, descriptionHi: e.target.value })} />
          </FormField>
          <FormField label="Benefits (English)">
            <Textarea rows={3} value={form.benefitsEn} onChange={(e) => setForm({ ...form, benefitsEn: e.target.value })} />
          </FormField>
          <FormField label="Benefits (Hindi)">
            <Textarea rows={3} value={form.benefitsHi} onChange={(e) => setForm({ ...form, benefitsHi: e.target.value })} />
          </FormField>
          <FormField label="Eligibility (English)">
            <Textarea rows={2} value={form.eligibilityEn} onChange={(e) => setForm({ ...form, eligibilityEn: e.target.value })} />
          </FormField>
          <FormField label="Eligibility (Hindi)">
            <Textarea rows={2} value={form.eligibilityHi} onChange={(e) => setForm({ ...form, eligibilityHi: e.target.value })} />
          </FormField>
          <FormField label="Brochure URL">
            <Input type="url" value={form.brochureUrl} onChange={(e) => setForm({ ...form, brochureUrl: e.target.value })} />
          </FormField>
          <FormField label="Official Quote URL">
            <Input type="url" value={form.officialQuoteUrl} onChange={(e) => setForm({ ...form, officialQuoteUrl: e.target.value })} />
          </FormField>
          <FormField label="UIN">
            <Input value={form.uin} onChange={(e) => setForm({ ...form, uin: e.target.value })} />
          </FormField>
          <FormField label="Display Order">
            <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
          </FormField>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" checked={form.isVerified} onChange={(e) => setForm({ ...form, isVerified: e.target.checked })} />
              Verified
            </label>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              Published
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </Modal>
      {dialog}
    </div>
  );
}