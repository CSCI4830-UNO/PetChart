"use client";

import React from "react";
import Image from "next/image";

// this function is used to upload a photo to the server and manage its state
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

  // extracts file ID from URL
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

  // this is called when the user picks a file
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

  // uploads the file to the server
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

  // clears current selection
  function handleRemove() {
    setFile(null);
    setPreview(null);
    onChange?.(null);
  }

  // renders the main component
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-slate-900">{label}</div>

      <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center hover:bg-slate-50">
        <div className="space-y-2">
          <div className="text-2xl">📷</div>
          <div className="text-sm text-slate-600">
            Drag & drop or <span className="font-semibold text-slate-900">choose a photo</span>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handlePick} />
        </div>
      </label>

      {error && <div className="text-xs text-rose-600">{error}</div>}
      
    </div>
  );
}
