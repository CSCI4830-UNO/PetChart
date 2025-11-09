import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import connectDB from "@/lib/mongoose"; // left as-is, might rename later
import Pet from "@/models/Pet";

// just a helper to check auth – not used yet but might use later
async function isAuthenticated() {
    const sess = await getServerSession(authConfig);
    return sess?.user?.email || null;
}

// GET /api/pets - returns list of pets for the user
export async function GET(request: NextRequest) {
    let petsList = [];
    try {
        const sess = await getServerSession(authConfig);

        if (!sess || !sess.user || !sess.user.email) {
            // logging here might be useful for debugging later
            return NextResponse.json({ error: "Auth failed" }, { status: 401 });
        }

        await connectDB(); // we might want to handle DB errors separately later

        petsList = await Pet.find({
            owner: sess.user.email
        }).sort({ name: 1 }); // I like alphabetical for now

        return NextResponse.json(petsList);
    } catch (e) {
        console.error("Issue while getting pets:", e); // gonna clean this later
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

// POST /api/pets - adds a pet to user's profile
export async function POST(req: NextRequest) {
    try {
        const sessionData = await getServerSession(authConfig);

        if (!sessionData?.user?.email) {
            return NextResponse.json({ error: "Please login" }, { status: 401 });
        }

        await connectDB();

        const jsonBody = await req.json(); // name this something better?

        const {
            name,
            species,
            breed,
            age,
            weight,
            color,
            microchipId,
            birthday,
            notes,
            photos,
            photoUrl
        } = jsonBody;

        // bare minimum validation for now
        if (!name || !species || typeof age !== 'number') {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // might want to normalize date format later
        const petData = {
            name: name,
            species,
            breed,
            age,
            weight,
            color,
            microchipId: microchipId ?? null,
            birthday: birthday ? new Date(birthday) : null,
            owner: sessionData.user.email,
            medicalHistory: {
                vaccinations: [],
                treatments: [],
                medications: []
            },
            notes: notes || "",
            photos: Array.isArray(photos)
                ? photos
                : photoUrl
                ? [photoUrl]
                : []
        };

        const result = await new Pet(petData).save();

        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        console.log("Pet creation error:", err); // revisit logging later
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
