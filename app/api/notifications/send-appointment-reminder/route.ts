import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Appointment from "@/models/Appointment";
import Pet from "@/models/Pet";
import User from "@/models/User";
import { sendAppointmentReminder } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId is required" },
        { status: 400 }
      );
    }

    // Get appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      owner: session.user.email,
    }).populate("petId");

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Get user
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check notification preferences
    if (!user.notificationPreferences?.appointmentReminders) {
      return NextResponse.json(
        {
          error:
            "Appointment reminders are disabled. Enable them in your settings.",
        },
        { status: 400 }
      );
    }

    // Send reminder
    const result = await sendAppointmentReminder({
      email: session.user.email,
      petName: appointment.petName,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      location: appointment.location,
      reason: appointment.reason,
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
    console.error("Error sending appointment reminder:", error);
    return NextResponse.json(
      { error: "Failed to send reminder" },
      { status: 500 }
    );
  }
}
