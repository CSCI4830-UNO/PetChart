import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Pet from "@/models/Pet";
import { Types } from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid pet ID" }, { status: 400 });
    }

    const body = await request.json();
    const { medication, dosage, startDate, endDate, notes } = body;

    if (!medication || !dosage || !startDate) {
      return NextResponse.json({ error: "Missing required fields: medication, dosage, startDate" }, { status: 400 });
    }

    const medObj: any = {
      medication: medication.trim(),
      dosage: dosage.trim(),
      startDate: new Date(startDate),
      notes: notes?.trim() || undefined
    };

    if (endDate) {
      medObj.endDate = new Date(endDate);
    }

    const updated = await Pet.findOneAndUpdate(
      { _id: id, owner: session.user.email },
      { $push: { "medicalHistory.medications": medObj } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Pet not found or not owned by user" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error adding medication:", error);
    return NextResponse.json({ error: "Failed to add medication" }, { status: 500 });
  }
}
