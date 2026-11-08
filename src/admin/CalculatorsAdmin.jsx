import { useEffect, useState } from "react";
import { adminRepository } from "../services/adminRepository";
import { describeFirestoreError } from "../services/validation";
import { Alert, Button, FormField, Input, Modal, Select, StatusBadge, useConfirm } from "./ui";

const emptyForm = {
  companyId: "",
  labelEn: "",
  labelHi: "",
  category: "Calculator",
  url: "",
  isVerified: false,
  isPublished: false,
  displayOrder: 99,
};

export default function CalculatorsAdmin() {
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
      const [ls, cs] = await Promise.all([adminRepository.listCalculatorLinks(), adminRepository.listCompanies()]);
      setItems(ls);
      setCompanies(cs);
    } catch (e) {
      setError(describeFirestoreError(e, "Failed to load calculator links."));
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
      companyId: item.companyId ?? "",
      labelEn: item.labelEn ?? "",
      labelHi: item.labelHi ?? "",
      category: item.category ?? "Calculator",
      url: item.url ?? "",
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
    if (!v) return false;
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
    if (!form.labelEn.trim() || !form.labelHi.trim()) {
      setFormError("Both English and Hindi labels are required.");
      return;
    }
    if (!validUrl(form.url)) {
      setFormError("A valid official calculator URL is required (including https://).");
      return;
    }
    if (form.companyId && !companies.some((c) => c.id === form.companyId)) {
      setFormError("The selected company no longer exists. Please choose another company.");
      return;
    }
    setSaving(true);
    setFormError("");
    setNotice("");
    try {
      const payload = {
        companyId: form.companyId || null,
        labelEn: form.labelEn.trim(),
        labelHi: form.labelHi.trim(),
        category: form.category,
        url: form.url.trim(),
        isVerified: form.isVerified,
        isPublished: form.isPublished,
        displayOrder: Number(form.displayOrder) || 99,
      };
      if (editing) {
        await adminRepository.updateCalculatorLink(editing.id, payload);
      } else {
        await adminRepository.createCalculatorLink(payload);
      }
      setModalOpen(false);
      setNotice(`Calculator link "${payload.labelEn}" ${editing ? "updated" : "added"} successfully.`);
      await load();
    } catch (e) {
      setFormError(describeFirestoreError(e, "Could not save the calculator link. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    setError("");
    setNotice("");
    const ok = await confirm(
      `Delete calculator link "${item.labelEn}"? This cannot be undone.`,
      { confirmLabel: "Delete link", variant: "danger" },
    );
    if (!ok) return;
    try {
      await adminRepository.deleteCalculatorLink(item.id);
      setNotice(`Calculator link "${item.labelEn}" deleted.`);
      await load();
    } catch (e) {
      setError(describeFirestoreError(e, "Delete failed. Nothing was deleted."));
    }
  }

  async function togglePublished(item) {
    const next = !item.isPublished;
    const ok = await confirm(
      next
        ? `Publish calculator link "${item.labelEn}"? It will appear on the public website only when it is also Verified.`
        : `Unpublish calculator link "${item.labelEn}"? It will be hidden from the public website immediately.`,
      { confirmLabel: next ? "Publish" : "Unpublish", variant: next ? "primary" : "danger" },
    );
    if (!ok) return;
    setError("");
    setNotice("");
    try {
      await adminRepository.setCalculatorLinkPublished(item.id, next);
      setNotice(`Calculator link "${item.labelEn}" ${next ? "published" : "unpublished"}.`);
      await load();
    } catch (e) {
      setError(describeFirestoreError(e, "Update failed."));
    }
  }

  async function toggleVerified(item) {
    const next = !item.isVerified;
    const ok = await confirm(
      next
        ? `Mark calculator link "${item.labelEn}" as Verified? Combined with Published, this makes it visible on the public website.`
        : `Remove verification from "${item.labelEn}"? It will be hidden from the public website immediately.`,
      { confirmLabel: next ? "Mark verified" : "Remove verification", variant: next ? "primary" : "danger" },
    );
    if (!ok) return;
    setError("");
    setNotice("");
    try {
      await adminRepository.setCalculatorLinkVerified(item.id, next);
      setNotice(`Calculator link "${item.labelEn}" ${next ? "verified" : "unverified"}.`);
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
        <h1 className="text-2xl font-bold text-navy">Calculator Links</h1>
        <Button onClick={openCreate}>+ Add Link</Button>
      </div>
      <p className="mt-1 text-sm text-navy/70">
        Only official insurer calculator/quote URLs. No custom premium calculator.
      </p>
      {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      {notice && <Alert tone="success" className="mt-4">{notice}</Alert>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
        {loading ? (
          <div className="p-6 text-sm text-navy/70">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-navy/70">No calculator links yet.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-soft-white text-left text-navy/70">
              <tr>
                <th className="px-4 py-3 font-medium">Label (EN)</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-navy/5">
                  <td className="px-4 py-3 font-medium text-navy">{item.labelEn}</td>
                  <td className="px-4 py-3 text-navy/70">{companyName(item.companyId)}</td>
                  <td className="px-4 py-3 text-navy/70">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-royal hover:underline">
                      {item.url}
                    </a>
                  </td>
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

      <Modal open={modalOpen} title={editing ? "Edit Calculator Link" : "Add Calculator Link"} onClose={closeModal} width="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <Alert tone="error">{formError}</Alert>}
          <FormField label="Label (English) *">
            <Input value={form.labelEn} onChange={(e) => setForm({ ...form, labelEn: e.target.value })} required />
          </FormField>
          <FormField label="Label (Hindi) *">
            <Input value={form.labelHi} onChange={(e) => setForm({ ...form, labelHi: e.target.value })} required />
          </FormField>
          <FormField label="Company">
            <Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
              <option value="">— None —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Category">
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </FormField>
          <FormField label="Official Calculator URL *">
            <Input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
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