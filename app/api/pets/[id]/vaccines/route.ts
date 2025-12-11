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
    const session = await getServerSession(authConfig) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid pet ID" }, { status: 400 });
    }

    const body = await request.json();
    const { vaccine, date, nextDue } = body;

    if (!vaccine || !date) {
      return NextResponse.json({ error: "Missing required fields: vaccine, date" }, { status: 400 });
    }

    const vacObj: any = {
      vaccine: vaccine.trim(),
      date: new Date(date),
    };

    if (nextDue) {
      vacObj.nextDue = new Date(nextDue);
    }

    const updated = await Pet.findOneAndUpdate(
      { _id: id, owner: session.user.email },
      { $push: { "medicalHistory.vaccinations": vacObj } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Pet not found or not owned by user" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error adding vaccination:", error);
    return NextResponse.json({ error: "Failed to add vaccination" }, { status: 500 });
  }
}
