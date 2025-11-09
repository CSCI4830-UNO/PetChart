import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Pet from "@/models/Pet";
import { Types } from "mongoose";

// GET - Fetch a specific pet by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authConfig);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { id } = await params;

        // Validate ObjectId format
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid pet ID" }, { status: 400 });
        }

        const pet = await Pet.findOne({
            _id: id,
            owner: session.user.email
        });

        if (!pet) {
            return NextResponse.json({ error: "Pet not found" }, { status: 404 });
        }

        return NextResponse.json(pet);
    } catch (error) {
        console.error("Error fetching pet:", error);
        return NextResponse.json(
            { error: "Failed to fetch pet" },
            { status: 500 }
        );
    }
}

// PUT - Update a specific pet
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authConfig);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { id } = await params;

        // Validate ObjectId format
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid pet ID" }, { status: 400 });
        }

    const body = await request.json();
    const { name, species, breed, age, weight, color, microchipId, birthday, notes, photos, photoUrl } = body;

        // Validate required fields
        if (!name || !species) {
            return NextResponse.json(
                { error: "Name and species are required" },
                { status: 400 }
            );
        }

        // Validate age
        if (age !== undefined && (age < 0 || age > 50)) {
            return NextResponse.json(
                { error: "Age must be between 0 and 50 years" },
                { status: 400 }
            );
        }

        // Validate weight
        if (weight !== undefined && weight < 0) {
            return NextResponse.json(
                { error: "Weight must be a positive number" },
                { status: 400 }
            );
        }

        // Validate birthday
        if (birthday) {
            const birthDate = new Date(birthday);
            const today = new Date();
            if (birthDate > today) {
                return NextResponse.json(
                    { error: "Birthday cannot be in the future" },
                    { status: 400 }
                );
            }
        }

        // Find and update the pet (include photos if present)
        const updatePayload: any = {
            name: name.trim(),
            species: species.trim(),
            breed: breed?.trim() || undefined,
            age: age || 0,
            weight: weight || undefined,
            color: color?.trim() || undefined,
            microchipId: microchipId?.trim() || undefined,
            birthday: birthday || undefined,
            notes: notes?.trim() || undefined,
            updatedAt: new Date()
        };

        if (Array.isArray(photos)) {
            updatePayload.photos = photos;
        } else if (photoUrl) {
            updatePayload.photos = [photoUrl];
        }

        // Find and update the pet
        const updatedPet = await Pet.findOneAndUpdate(
            {
                _id: id,
                owner: session.user.email
            },
            updatePayload,
            { 
                new: true, // Return updated document
                runValidators: true // Run schema validators
            }
        );

        if (!updatedPet) {
            return NextResponse.json({ error: "Pet not found" }, { status: 404 });
        }

        return NextResponse.json(updatedPet);
    } catch (error) {
        console.error("Error updating pet:", error);
        
        // Handle validation errors
        if (error instanceof Error && error.name === "ValidationError") {
            return NextResponse.json(
                { error: "Invalid pet data provided" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update pet" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a specific pet
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authConfig);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { id } = await params;

        // Validate ObjectId format
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid pet ID" }, { status: 400 });
        }

        // Find and delete the pet
        const deletedPet = await Pet.findOneAndDelete({
            _id: id,
            owner: session.user.email
        });

        if (!deletedPet) {
            return NextResponse.json({ error: "Pet not found" }, { status: 404 });
        }

        // TODO: In a production app, you might want to:
        // 1. Delete related appointments
        // 2. Archive data instead of hard delete
        // 3. Log the deletion for audit purposes

        return NextResponse.json({ 
            message: "Pet deleted successfully",
            deletedPet: {
                id: deletedPet._id,
                name: deletedPet.name
            }
        });
    } catch (error) {
        console.error("Error deleting pet:", error);
        return NextResponse.json(
            { error: "Failed to delete pet" },
            { status: 500 }
        );
    }
}