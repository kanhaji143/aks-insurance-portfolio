import { useEffect, useState } from "react";
import { adminRepository } from "../services/adminRepository";
import { describeFirestoreError, companyDeleteDependencyMessage } from "../services/validation";
import { Alert, Button, FormField, Input, Modal, StatusBadge, Textarea, useConfirm } from "./ui";

const emptyForm = {
  nameEn: "",
  nameHi: "",
  descriptionEn: "",
  descriptionHi: "",
  websiteUrl: "",
  logoUrl: "",
  isVerified: false,
  isPublished: false,
  displayOrder: 99,
};

// Live logo preview. UI-only: renders whatever URL is currently in the form.
function LogoPreview({ url }) {
  const src = (url ?? "").trim();
  const [failed, setFailed] = useState(false);

  // Reset the error state whenever the URL changes.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src) return null;

  if (failed) {
    return (
      <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
        Logo could not be loaded.
      </p>
    );
  }

  return (
    <div className="mt-2 flex h-24 w-full items-center justify-center rounded-lg border border-navy/10 bg-soft-white p-2">
      <img
        key={src}
        src={src}
        alt="Company logo preview"
        className="max-h-full max-w-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function Companies() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { confirm, dialog } = useConfirm();

  // Success banners clear themselves so they never pile up.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems(await adminRepository.listCompanies());
    } catch (e) {
      setError(describeFirestoreError(e, "Failed to load companies."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      nameEn: item.nameEn ?? item.name ?? "",
      nameHi: item.nameHi ?? "",
      descriptionEn: item.descriptionEn ?? item.description ?? "",
      descriptionHi: item.descriptionHi ?? "",
      websiteUrl: item.websiteUrl ?? "",
      logoUrl: item.logoUrl ?? "",
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

  async function handleSave(e) {
    e.preventDefault();
    // Validation errors stay inside the modal and keep the typed values.
    if (!form.nameEn.trim()) {
      setFormError("Company name (English) is required.");
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
      const payload = {
        // New bilingual fields
        nameEn,
        nameHi,
        descriptionEn,
        descriptionHi,
        // Legacy mirrors kept for backward compatibility (not deleted).
        name: nameEn,
        description: descriptionEn,
        websiteUrl: form.websiteUrl.trim(),
        logoUrl: form.logoUrl.trim(),
        isVerified: form.isVerified,
        isPublished: form.isPublished,
        displayOrder: Number(form.displayOrder) || 99,
      };
      if (editing) {
        await adminRepository.updateCompany(editing.id, payload);
      } else {
        await adminRepository.createCompany(payload);
      }
      setModalOpen(false);
      setNotice(`Company "${nameEn}" ${editing ? "updated" : "added"} successfully.`);
      await load();
    } catch (e) {
      setFormError(describeFirestoreError(e, "Could not save the company. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  const displayName = (item) => item.nameEn ?? item.name ?? "";

  async function handleDelete(item) {
    setError("");
    setNotice("");

    // Check dependent plans and calculator links first — the repository
    // enforces the same guard before deleting.
    let planCount = 0;
    let linkCount = 0;
    try {
      [planCount, linkCount] = await Promise.all([
        adminRepository.countPlansByCompany(item.id),
        adminRepository.countCalculatorLinksByCompany(item.id),
      ]);
    } catch (e) {
      setError(describeFirestoreError(e, "Could not check dependent records."));
      return;
    }
    const detail = companyDeleteDependencyMessage({ plans: planCount, links: linkCount });
    if (detail) {
      setError(
        `Cannot delete "${displayName(item)}": ${detail}. ` +
          "Delete or reassign those records first. Nothing was deleted.",
      );
      return;
    }

    const ok = await confirm(
      `Delete company "${displayName(item)}"? This cannot be undone.`,
      { confirmLabel: "Delete company", variant: "danger" },
    );
    if (!ok) return;
    try {
      await adminRepository.deleteCompany(item.id);
      setNotice(`Company "${displayName(item)}" deleted.`);
      await load();
    } catch (e) {
      setError(describeFirestoreError(e, "Delete failed. Nothing was deleted."));
    }
  }

  async function togglePublished(item) {
    const next = !item.isPublished;
    const ok = await confirm(
      next
        ? `Publish company "${displayName(item)}"? It will appear on the public website only when it is also Verified.`
        : `Unpublish company "${displayName(item)}"? It will be hidden from the public website immediately.`,
      { confirmLabel: next ? "Publish" : "Unpublish", variant: next ? "primary" : "danger" },
    );
    if (!ok) return;
    setError("");
    setNotice("");
    try {
      await adminRepository.setCompanyPublished(item.id, next);
      setNotice(`Company "${displayName(item)}" ${next ? "published" : "unpublished"}.`);
      await load();
    } catch (e) {
      setError(describeFirestoreError(e, "Update failed."));
    }
  }

  async function toggleVerified(item) {
    const next = !item.isVerified;
    const ok = await confirm(
      next
        ? `Mark company "${displayName(item)}" as Verified? Combined with Published, this makes it visible on the public website.`
        : `Remove verification from "${displayName(item)}"? It will be hidden from the public website immediately.`,
      { confirmLabel: next ? "Mark verified" : "Remove verification", variant: next ? "primary" : "danger" },
    );
    if (!ok) return;
    setError("");
    setNotice("");
    try {
      await adminRepository.setCompanyVerified(item.id, next);
      setNotice(`Company "${displayName(item)}" ${next ? "verified" : "unverified"}.`);
      await load();
    } catch (e) {
      setError(describeFirestoreError(e, "Update failed."));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Insurance Companies</h1>
        <Button onClick={openCreate}>+ Add Company</Button>
      </div>
      {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      {notice && <Alert tone="success" className="mt-4">{notice}</Alert>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
        {loading ? (
          <div className="p-6 text-sm text-navy/70">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-navy/70">No companies yet. Add one to get started.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-soft-white text-left text-navy/70">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-navy/5">
                  <td className="px-4 py-3 font-medium text-navy">{displayName(item)}</td>
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
                  <td className="px-4 py-3 text-navy/70">{item.displayOrder}</td>
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

      <Modal open={modalOpen} title={editing ? "Edit Company" : "Add Company"} onClose={closeModal}>
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <Alert tone="error">{formError}</Alert>}
          <FormField label="Name (English) *">
            <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
          </FormField>
          <FormField label="Name (Hindi)">
            <Input value={form.nameHi} onChange={(e) => setForm({ ...form, nameHi: e.target.value })} />
          </FormField>
          <FormField label="Description (English)">
            <Textarea rows={3} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          </FormField>
          <FormField label="Description (Hindi)">
            <Textarea rows={3} value={form.descriptionHi} onChange={(e) => setForm({ ...form, descriptionHi: e.target.value })} />
          </FormField>
          <FormField label="Website URL">
            <Input type="url" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
          </FormField>
          <FormField label="Logo URL">
            <Input type="url" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
            <LogoPreview url={form.logoUrl} />
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