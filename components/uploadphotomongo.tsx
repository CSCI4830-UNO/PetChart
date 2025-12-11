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
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // keep preview in sync when parent updates value
  React.useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    if (!file) {
      setPreview(value.startsWith("/api/") ? value : `/api/images/${value}`);
    }
  }, [value, file]);

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

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    if (!dropped.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (dropped.size > 8 * 1024 * 1024) {
      setError("Maximum size is 8MB.");
      return;
    }
    setError(null);
    setFile(dropped);
    setPreview(URL.createObjectURL(dropped));
    uploadFile(dropped);
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
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex cursor-pointer items-center justify-center rounded-xl border border-dashed p-6 text-center transition-colors ${
          isDragging
            ? "border-slate-500 bg-slate-50"
            : "border-slate-300 bg-white hover:bg-slate-50"
        }`}
      >
        <div className="space-y-2">
          <div className="text-2xl">📷</div>
          <div className="text-sm text-slate-600">
            Drag & drop or <span className="font-semibold text-slate-900">choose a photo</span>
          </div>
          <div className="text-xs text-slate-500">Up to 8MB • JPG/PNG/WebP</div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePick}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-slate-900"></div>
          </div>
        )}
      </div>

      {preview && (
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <div className="relative h-56 w-full bg-slate-100">
            <Image
              src={preview}
              alt="Uploaded pet"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-700 bg-white">
            <span>{file?.name || "Current photo"}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-rose-600 hover:text-rose-700"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {error && <div className="text-xs text-rose-600">{error}</div>}

    </div>
  );
}
