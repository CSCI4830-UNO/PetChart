import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Pet from "@/models/Pet";
import { connectToDB } from "@/lib/db";
// If you have your own auth options file, import it:
import { authConfig as authOptions } from "@/lib/auth";


export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pets = await Pet.find({ owner: session.user.email })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(pets);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch pets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Accept either `photoUrl` (legacy) or `photos` (array)
    let photos: string[] = [];
    if (Array.isArray(body.photos)) {
      photos = body.photos.filter((u: any) => typeof u === "string" && u.trim().length > 0);
    } else if (typeof body.photoUrl === "string" && body.photoUrl.trim()) {
      photos = [body.photoUrl.trim()];
    }

    // Minimal required fields
    if (!body.name || !body.species) {
      return NextResponse.json({ error: "Name and species are required" }, { status: 400 });
    }

    const doc = await Pet.create({
      name: body.name,
      species: body.species,
      breed: body.breed || undefined,
      age: typeof body.age === "number" ? body.age : Number(body.age ?? 0),
      weight: body.weight ? Number(body.weight) : undefined,
      color: body.color || undefined,
      microchipId: body.microchipId || undefined,
      birthday: body.birthday ? new Date(body.birthday) : undefined,
      notes: body.notes || undefined,
      photos,                          // <- persist photos
      owner: session.user.email,       // <- link to user
      dateAdded: new Date(),
      medicalHistory: {
        vaccinations: [],
        treatments: [],
        medications: [],
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create pet" }, { status: 500 });
  }
}
