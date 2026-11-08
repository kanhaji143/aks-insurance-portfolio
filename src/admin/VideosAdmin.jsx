import { useEffect, useState } from "react";
import { adminRepository } from "../services/adminRepository";
import { describeFirestoreError, isValidYoutubeVideoId } from "../services/validation";
import { Alert, Button, FormField, Input, Modal, StatusBadge, Textarea, useConfirm } from "./ui";

const emptyForm = {
  titleEn: "",
  titleHi: "",
  descriptionEn: "",
  descriptionHi: "",
  youtubeVideoId: "",
  isVerified: false,
  isPublished: false,
  displayOrder: 99,
};

export default function VideosAdmin() {
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

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems(await adminRepository.listVideos());
    } catch (e) {
      setError(describeFirestoreError(e, "Failed to load videos."));
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
      titleEn: item.titleEn ?? "",
      titleHi: item.titleHi ?? "",
      descriptionEn: item.descriptionEn ?? "",
      descriptionHi: item.descriptionHi ?? "",
      youtubeVideoId: item.youtubeVideoId ?? "",
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
    if (!form.titleEn.trim() || !form.titleHi.trim()) {
      setFormError("Both English and Hindi titles are required.");
      return;
    }
    if (!form.youtubeVideoId.trim()) {
      setFormError("YouTube video ID is required.");
      return;
    }
    if (!isValidYoutubeVideoId(form.youtubeVideoId)) {
      setFormError(
        "Invalid YouTube video ID. It must be exactly 11 characters (letters, numbers, _ or -). " +
          "Paste only the ID, not the full URL. Example: dQw4w9WgXcQ",
      );
      return;
    }
    setSaving(true);
    setFormError("");
    setNotice("");
    try {
      const payload = {
        titleEn: form.titleEn.trim(),
        titleHi: form.titleHi.trim(),
        descriptionEn: form.descriptionEn.trim(),
        descriptionHi: form.descriptionHi.trim(),
        youtubeVideoId: form.youtubeVideoId.trim(),
        isVerified: form.isVerified,
        isPublished: form.isPublished,
        displayOrder: Number(form.displayOrder) || 99,
      };
      if (editing) {
        await adminRepository.updateVideo(editing.id, payload);
      } else {
        await adminRepository.createVideo(payload);
      }
      setModalOpen(false);
      setNotice(`Video "${payload.titleEn}" ${editing ? "updated" : "added"} successfully.`);
      await load();
    } catch (e) {
      setFormError(describeFirestoreError(e, "Could not save the video. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    setError("");
    setNotice("");
    const ok = await confirm(
      `Delete video "${item.titleEn}"? This cannot be undone.`,
      { confirmLabel: "Delete video", variant: "danger" },
    );
    if (!ok) return;
    try {
      await adminRepository.deleteVideo(item.id);
      setNotice(`Video "${item.titleEn}" deleted.`);
      await load();
    } catch (e) {
      setError(describeFirestoreError(e, "Delete failed. Nothing was deleted."));
    }
  }

  async function togglePublished(item) {
    const next = !item.isPublished;
    const ok = await confirm(
      next
        ? `Publish video "${item.titleEn}"? It will appear on the public website only when it is also Verified.`
        : `Unpublish video "${item.titleEn}"? It will be hidden from the public website immediately.`,
      { confirmLabel: next ? "Publish" : "Unpublish", variant: next ? "primary" : "danger" },
    );
    if (!ok) return;
    setError("");
    setNotice("");
    try {
      await adminRepository.setVideoPublished(item.id, next);
      setNotice(`Video "${item.titleEn}" ${next ? "published" : "unpublished"}.`);
      await load();
    } catch (e) {
      setError(describeFirestoreError(e, "Update failed."));
    }
  }

  async function toggleVerified(item) {
    const next = !item.isVerified;
    const ok = await confirm(
      next
        ? `Mark video "${item.titleEn}" as Verified? Combined with Published, this makes it visible on the public website.`
        : `Remove verification from "${item.titleEn}"? It will be hidden from the public website immediately.`,
      { confirmLabel: next ? "Mark verified" : "Remove verification", variant: next ? "primary" : "danger" },
    );
    if (!ok) return;
    setError("");
    setNotice("");
    try {
      await adminRepository.setVideoVerified(item.id, next);
      setNotice(`Video "${item.titleEn}" ${next ? "verified" : "unverified"}.`);
      await load();
    } catch (e) {
      setError(describeFirestoreError(e, "Update failed."));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">YouTube Videos</h1>
        <Button onClick={openCreate}>+ Add Video</Button>
      </div>
      <p className="mt-1 text-sm text-navy/70">
        Embedded via youtube-nocookie.com using the video ID only.
      </p>
      {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      {notice && <Alert tone="success" className="mt-4">{notice}</Alert>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
        {loading ? (
          <div className="p-6 text-sm text-navy/70">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-navy/70">No videos yet.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-soft-white text-left text-navy/70">
              <tr>
                <th className="px-4 py-3 font-medium">Title (EN)</th>
                <th className="px-4 py-3 font-medium">Video ID</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-navy/5">
                  <td className="px-4 py-3 font-medium text-navy">{item.titleEn}</td>
                  <td className="px-4 py-3 text-navy/70">{item.youtubeVideoId}</td>
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

      <Modal open={modalOpen} title={editing ? "Edit Video" : "Add Video"} onClose={closeModal} width="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <Alert tone="error">{formError}</Alert>}
          <FormField label="Title (English) *">
            <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required />
          </FormField>
          <FormField label="Title (Hindi) *">
            <Input value={form.titleHi} onChange={(e) => setForm({ ...form, titleHi: e.target.value })} required />
          </FormField>
          <FormField label="Description (English)">
            <Textarea rows={2} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          </FormField>
          <FormField label="Description (Hindi)">
            <Textarea rows={2} value={form.descriptionHi} onChange={(e) => setForm({ ...form, descriptionHi: e.target.value })} />
          </FormField>
          <FormField label="YouTube Video ID *" hint="Just the ID, e.g. dQw4w9WgXcQ">
            <Input value={form.youtubeVideoId} onChange={(e) => setForm({ ...form, youtubeVideoId: e.target.value })} required />
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