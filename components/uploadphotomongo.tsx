"use client";

import React from "react";
import Image from "next/image";

export default function UploadPhotoMongo({
  value, // current fileId or full URL (optional)
  onChange, // (urlOrId: string | null) => void
  onUploading, // optional callback to notify parent of upload state
  label = "Pet Photo",
}: {
  value?: string | null;
  onChange?: (v: string | null) => void;
  onUploading?: (isUploading: boolean) => void;
  label?: string;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(
    value ? (value.startsWith("/api/") ? value : `/api/images/${value}`) : null
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Please choose an image");
    if (f.size > 8 * 1024 * 1024) return setError("Max 8MB");
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    // auto-upload immediately after selecting a file for a smoother UX
    uploadFile(f);
  }

  async function upload() {
    if (!file) return;
    setLoading(true);
    onUploading?.(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("filename", file.name);
      const res = await fetch("/api/images/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setPreview(data.url);
      onChange?.(data.url);
    } catch (e: any) {
      setError(e.message || "Upload failed");
      onChange?.(null);
    } finally {
      setLoading(false);
      onUploading?.(false);
    }
  }

  // helper to upload a provided File immediately
  async function uploadFile(f: File) {
    setLoading(true);
    onUploading?.(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("filename", f.name);
      const res = await fetch("/api/images/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setPreview(data.url);
      onChange?.(data.url);
    } catch (e: any) {
      setError(e.message || "Upload failed");
      onChange?.(null);
    } finally {
      setLoading(false);
      onUploading?.(false);
    }
  }

  function remove() {
    setFile(null);
    setPreview(null);
    onChange?.(null);
  }

  // UI
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-slate-900">{label}</div>
      <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center hover:bg-slate-50">
        <div className="space-y-2">
          <div className="text-2xl">📷</div>
          <div className="text-sm text-slate-600">
            Drag & drop or <span className="font-semibold text-slate-900">choose a photo</span>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={pick} />
        </div>
      </label>

      {preview && (
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-lg ring-1 ring-slate-200">
            <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
          </div>
          <div className="flex gap-2">
            <button
              onClick={upload}
              disabled={loading}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Uploading…" : "Upload"}
            </button>
            <button
              onClick={remove}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {!preview && <div className="text-xs text-slate-500">PNG, JPG, HEIC up to 8MB.</div>}
      {error && <div className="text-xs text-rose-600">{error}</div>}
    </div>
  );
}
