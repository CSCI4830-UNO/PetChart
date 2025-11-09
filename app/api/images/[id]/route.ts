import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params;               
    const { bucket } = await getDb();

    const _id = new ObjectId(id);

    // probe file to set headers
    const files = await bucket.find({ _id }).toArray();
    if (files.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const file = files[0];
    const stream = bucket.openDownloadStream(_id);

    const headers = new Headers();
    headers.set("Content-Type", file.contentType || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    // @ts-expect-error: Web Response accepts ReadableStream
    return new Response(stream, { headers });
  } catch (e) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
}
