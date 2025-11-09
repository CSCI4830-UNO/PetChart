import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import { getDb } from "@/lib/mongo";
import Pet from "@/models/Pet";
import { Types } from "mongoose";

// GET - get a pet by its ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    let sess;
    try {
        sess = await getServerSession(authConfig);
        if (!sess || !sess.user?.email) {
            return NextResponse.json({ error: "Need to be logged in" }, { status: 401 });
        }

        await dbConnect();

        const { id } = await params;

        if (!Types.ObjectId.isValid(id)) {
            // maybe throw here? not sure
            return NextResponse.json({ error: "Not a valid ID" }, { status: 400 });
        }

        const foundPet = await Pet.findOne({ _id: id, owner: sess.user.email });

        if (!foundPet) {
            return NextResponse.json({ error: "No pet with that ID" }, { status: 404 });
        }

        return NextResponse.json(foundPet);
    } catch (e) {
        console.log("Fetch error:", e); // should clean up before commit
        return NextResponse.json({ error: "Error while fetching pet" }, { status: 500 });
    }
}

// PUT - update a pet
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authConfig);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Auth required" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid pet ID format" }, { status: 400 });
        }

        const data = await req.json();

        // maybe destructure more cleanly later
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
        } = data;

        if (!name || !species) {
            return NextResponse.json({ error: "Missing name/species" }, { status: 400 });
        }

        if (typeof age === "number" && (age < 0 || age > 50)) {
            return NextResponse.json({ error: "Pet age is not in a valid range" }, { status: 400 });
        }

        if (typeof weight === "number" && weight < 0) {
            return NextResponse.json({ error: "Weight can't be negative" }, { status: 400 });
        }

        if (birthday) {
            const birthD = new Date(birthday);
            if (birthD.getTime() > Date.now()) {
                return NextResponse.json({ error: "Future birthdate?" }, { status: 400 });
            }
        }

        // pet exists? we'll need this for cleanup
        const existingPet = await Pet.findOne({ _id: id, owner: session.user.email });

        // build update object
        const payload: any = {
            name: name.trim(),
            species: species.trim(),
            breed: breed?.trim() || null,
            age: age ?? 0,
            weight: weight ?? null,
            color: color?.trim() || null,
            microchipId: microchipId?.trim() || null,
            birthday: birthday || null,
            notes: notes?.trim() || "",
            updatedAt: new Date()
        };

        if (Array.isArray(photos)) {
            payload.photos = photos;
        } else if (photoUrl) {
            payload.photos = [photoUrl];
        }

        // cleanup removed GridFS photos
        try {
            const old = Array.isArray(existingPet?.photos) ? existingPet.photos : (existingPet?.photos ? [existingPet.photos] : []);
            const updated = Array.isArray(payload.photos) ? payload.photos : (payload.photos ? [payload.photos] : []);

            const extractId = (input: string) => {
                try {
                    const url = new URL(input, "http://localhost");
                    return url.pathname.split("/").pop();
                } catch {
                    return input;
                }
            };

            const oldIds = old.map(extractId).filter(Boolean);
            const newIds = updated.map(extractId).filter(Boolean);

            const removed = oldIds.filter((oldId: string) => !newIds.includes(oldId));

            if (removed.length > 0) {
                const { bucket } = await getDb();

                for (let rid of removed) {
                    try {
                        if (Types.ObjectId.isValid(rid)) {
                            const ObjectId = require("mongodb").ObjectId;
                            await bucket.delete(new ObjectId(rid));
                        } else {
                            console.log("Skipping invalid photo id:", rid);
                        }
                    } catch (err) {
                        console.warn("Error removing image:", rid, err);
                    }
                }
            }
        } catch (cleanErr) {
            console.log("GridFS cleanup problem:", cleanErr);
        }

        const updated = await Pet.findOneAndUpdate(
            { _id: id, owner: session.user.email },
            payload,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json({ error: "Update failed, pet not found" }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (err: any) {
        console.error("PUT error:", err);

        if (err?.name === "ValidationError") {
            return NextResponse.json({ error: "Bad pet data" }, { status: 400 });
        }

        return NextResponse.json({ error: "Server error during update" }, { status: 500 });
    }
}

// DELETE - remove a pet
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authConfig);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Auth missing" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const deleted = await Pet.findOneAndDelete({ _id: id, owner: session.user.email });

        if (!deleted) {
            return NextResponse.json({ error: "No such pet" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Pet gone",
            deletedPet: {
                id: deleted._id,
                name: deleted.name
            }
        });
    } catch (err) {
        console.error("DELETE error:", err);
        return NextResponse.json({ error: "Couldn’t delete pet" }, { status: 500 });
    }
}
