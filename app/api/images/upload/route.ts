import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { Readable } from "stream";

export const runtime = "nodejs";
export const maxDuration = 60;

async function blobToBuffer(blob: Blob) {
  const ab = await blob.arrayBuffer();
  return Buffer.from(ab);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image/* allowed" }, { status: 400 });
    }

    const filename = (form.get("filename") as string) || "upload";
    const buffer = await blobToBuffer(file);
    const stream = Readable.from(buffer);

    const { bucket } = await getDb();
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.type,
      metadata: { source: "pet-photo" },
    });

    await new Promise<void>((resolve, reject) => {
      stream.pipe(uploadStream)
        .on("error", reject)
        .on("finish", () => resolve());
    });

    return NextResponse.json({
      fileId: uploadStream.id.toString(),
      url: `/api/images/${uploadStream.id.toString()}`, // convenient same-origin URL
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
