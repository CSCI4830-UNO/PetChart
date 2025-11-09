"use client";

import React from "react";
import Image from "next/image";

// Handles photo uploads and shows a preview
export default function UploadPhotoMongo({
  value,       // current image URL or ID
  onChange,    // new image uploaded or removed
  onUploading, // informs on the current upload state
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

  // Extract file ID from URL
  function extractId(raw: string): string {
    try {
      const url = new URL(raw, location.origin);
      const segments = url.pathname.split("/").filter(Boolean);
      return segments.at(-1) || raw;
    } catch {
      const cleaned = raw.split(/[?#]/)[0];
      const parts = cleaned.split("/").filter(Boolean);
      return parts.at(-1) || cleaned;
    }
  }

  // Called when a file is selected
  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;

    if (!picked.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (picked.size > 8 * 1024 * 1024) {
      setError("Maximum size is 8MB.");
      return;
    }

    setError(null);
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
    uploadFile(picked); // auto-upload after selection
  }

  // Uploads image to server
  async function uploadFile(file: File) {
    setLoading(true);
    onUploading?.(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", file.name);

      if (value) {
        formData.append("previousId", extractId(value));
      }

      const res = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setPreview(data.url);
      onChange?.(data.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
      onChange?.(null);
    } finally {
      setLoading(false);
      onUploading?.(false);
    }
  }

  // Clears current selection
  function handleRemove() {
    setFile(null);
    setPreview(null);
    onChange?.(null);
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-slate-900">{label}</div>

      // upload box component
      <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center hover:bg-slate-50">
        <div className="space-y-2">
          <div className="text-2xl">📷</div>
          <div className="text-sm text-slate-600">
            Drag & drop or <span className="font-semibold text-slate-900">choose a photo</span>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handlePick} />
        </div>
      </label>

      // preview and buttons components
      {preview && (
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-lg ring-1 ring-slate-200">
            <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => file && uploadFile(file)}
              disabled={loading}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Uploading…" : "Upload"}
            </button>
            <button
              onClick={handleRemove}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      // Help text
      {!preview && (
        <div className="text-xs text-slate-500">Allowed: PNG, JPG, HEIC up to 8MB.</div>
      )}

      // Error message
      {error && <div className="text-xs text-rose-600">{error}</div>}
    </div>
  );
}
