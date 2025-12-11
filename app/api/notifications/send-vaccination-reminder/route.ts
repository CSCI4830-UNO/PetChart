import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Pet from "@/models/Pet";
import User from "@/models/User";
import { sendVaccinationReminder } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { petId, vaccineIndex } = await request.json();

    if (!petId || vaccineIndex === undefined) {
      return NextResponse.json(
        { error: "petId and vaccineIndex are required" },
        { status: 400 }
      );
    }

    // Get pet
    const pet = await Pet.findOne({
      _id: petId,
      owner: session.user.email,
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    const vaccine = pet.medicalHistory.vaccinations[vaccineIndex];
    if (!vaccine) {
      return NextResponse.json(
        { error: "Vaccination not found" },
        { status: 404 }
      );
    }

    // Get user
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check notification preferences
    if (!user.notificationPreferences?.vaccinationReminders) {
      return NextResponse.json(
        {
          error:
            "Vaccination reminders are disabled. Enable them in your settings.",
        },
        { status: 400 }
      );
    }

    if (!vaccine.nextDue) {
      return NextResponse.json(
        { error: "No next due date set for this vaccination" },
        { status: 400 }
      );
    }

    // Send reminder
    const result = await sendVaccinationReminder({
      email: session.user.email,
      petName: pet.name,
      vaccine: vaccine.vaccine,
      nextDueDate: vaccine.nextDue,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminder sent successfully",
    });
  } catch (error) {
    console.error("Error sending vaccination reminder:", error);
    return NextResponse.json(
      { error: "Failed to send reminder" },
      { status: 500 }
    );
  }
}
