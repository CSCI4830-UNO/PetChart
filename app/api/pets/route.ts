import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongoose";
import Pet from "@/models/Pet";

// GET /api/pets - Get all pets for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const pets = await Pet.find({ owner: session.user.email })
            .select('_id name species breed age')
            .sort({ name: 1 });

        return NextResponse.json(pets);
    } catch (error) {
        console.error("Error fetching pets:", error);
        return NextResponse.json({ error: "Failed to fetch pets" }, { status: 500 });
    }
}

// POST /api/pets - Create a new pet
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { name, species, breed, age, weight, color, microchipId, notes } = body;

        // Validate required fields
        if (!name || !species || age === undefined) {
            return NextResponse.json({ 
                error: "Missing required fields: name, species, age" 
            }, { status: 400 });
        }

        // Create new pet
        const pet = new Pet({
            name,
            species,
            breed,
            age,
            weight,
            color,
            microchipId,
            owner: session.user.email,
            medicalHistory: {
                vaccinations: [],
                treatments: [],
                medications: []
            },
            notes
        });

        await pet.save();

        return NextResponse.json(pet, { status: 201 });
    } catch (error) {
        console.error("Error creating pet:", error);
        return NextResponse.json({ error: "Failed to create pet" }, { status: 500 });
    }
}