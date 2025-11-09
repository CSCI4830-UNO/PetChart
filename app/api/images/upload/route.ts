import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";
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

    // After successfully storing the new file, try to delete the previous file
    let deletedPrevious = false;
    try {
      const prev = form.get("previousId") as string | null;
      const newIdStr = uploadStream.id.toString();
      console.log("Upload complete. newId=", newIdStr, "previousId=", prev);
      if (prev) {
        // normalize prev to a simple id if it's a URL
        const prevIdStr = prev.startsWith("/api/images/") ? prev.split("/").pop()! : prev;
        // only delete if it's a different id
        if (prevIdStr && prevIdStr !== newIdStr) {
          try {
            const _id = new ObjectId(prevIdStr);
            await bucket.delete(_id);
            deletedPrevious = true;
            console.log("Deleted previous upload:", prevIdStr);
          } catch (err) {
            // log delete errors
            console.warn("Could not delete previous upload:", prevIdStr, err);
          }
        } else {
          console.log("Previous id is same as new id or empty, skip delete", prevIdStr);
        }
      }
    } catch (err) {
      console.warn("Error while attempting to cleanup previous image:", err);
    }

    return NextResponse.json({
      fileId: uploadStream.id.toString(),
      url: `/api/images/${uploadStream.id.toString()}`, // convenient same-origin URL
      deletedPrevious,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
