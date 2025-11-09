import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Pet from "@/models/Pet";
import { connectToDB } from "@/app/lib/db";
import { Types } from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"; // adjust path

export const dynamic = "force-dynamic";

function notFound() {
  return NextResponse.json({ error: "Pet not found" }, { status: 404 });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Types.ObjectId.isValid(params.id)) return notFound();

    const pet = await Pet.findById(params.id).lean();
    if (!pet || pet.owner !== session.user.email) return notFound();

    return NextResponse.json(pet);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch pet" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Types.ObjectId.isValid(params.id)) return notFound();

    const existing = await Pet.findById(params.id);
    if (!existing || existing.owner !== session.user.email) return notFound();

    const body = await req.json();

    // Normalize photos input
    let photos: string[] | undefined = undefined;
    if (Array.isArray(body.photos)) {
      photos = body.photos.filter((u: any) => typeof u === "string" && u.trim().length > 0);
    } else if (typeof body.photoUrl === "string" && body.photoUrl.trim()) {
      photos = [body.photoUrl.trim()];
    }
    // If neither photos nor photoUrl provided, leave photos unchanged.

    // Build update
    const update: any = {
      name: body.name ?? existing.name,
      species: body.species ?? existing.species,
      breed: body.breed ?? existing.breed,
      age:
        typeof body.age === "number"
          ? body.age
          : body.age != null
          ? Number(body.age)
          : existing.age,
      weight:
        body.weight != null
          ? Number(body.weight)
          : existing.weight,
      color: body.color ?? existing.color,
      microchipId: body.microchipId ?? existing.microchipId,
      birthday: body.birthday ? new Date(body.birthday) : existing.birthday,
      notes: body.notes ?? existing.notes,
    };

    if (photos !== undefined) update.photos = photos;

    const saved = await Pet.findByIdAndUpdate(params.id, update, { new: true, runValidators: true }).lean();

    return NextResponse.json(saved);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update pet" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Types.ObjectId.isValid(params.id)) return notFound();

    const pet = await Pet.findById(params.id);
    if (!pet || pet.owner !== session.user.email) return notFound();

    await Pet.deleteOne({ _id: params.id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete pet" }, { status: 500 });
  }
}
