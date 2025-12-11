import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Pet from "@/models/Pet";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authConfig)) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { treatment, dosage, date, nextDue, prescribingVet, notes } = await request.json();

    if (!treatment || !date) {
      return NextResponse.json(
        { error: "Treatment and date are required" },
        { status: 400 }
      );
    }

    const pet = await Pet.findOne({
      _id: params.id,
      owner: session.user.email,
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    const fleaTreatment = {
      treatment,
      dosage: dosage || undefined,
      date: new Date(date),
      nextDue: nextDue ? new Date(nextDue) : undefined,
      prescribingVet: prescribingVet || undefined,
      notes,
    };

    pet.medicalHistory.fleaTickTreatments.push(fleaTreatment);
    await pet.save();

    return NextResponse.json(pet);
  } catch (error) {
    console.error("Error adding flea & tick treatment:", error);
    return NextResponse.json(
      { error: "Failed to add flea & tick treatment" },
      { status: 500 }
    );
  }
}
