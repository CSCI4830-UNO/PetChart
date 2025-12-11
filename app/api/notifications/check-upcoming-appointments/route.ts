import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { sendAppointmentReminder } from "@/lib/email";

export async function GET() {
  try {
    await dbConnect();

    // Get current date and time
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    // Find all scheduled appointments happening within the next 24 hours
    const upcomingAppointments = await Appointment.find({
      status: "scheduled",
      appointmentDate: {
        $gte: now.toISOString().split("T")[0],
        $lte: tomorrow.toISOString().split("T")[0],
      },
    });

    const results = [];

    for (const appointment of upcomingAppointments) {
      try {
        // Get user preferences
        const user = await User.findOne({ email: appointment.owner });

        if (!user) {
          results.push({
            appointmentId: appointment._id,
            status: "skipped",
            reason: "User not found",
          });
          continue;
        }

        // Check if user has appointment reminders enabled
        if (!user.notificationPreferences?.appointmentReminders) {
          results.push({
            appointmentId: appointment._id,
            status: "skipped",
            reason: "User has disabled appointment reminders",
          });
          continue;
        }

        // Check if reminder already sent today
        const lastReminderSent = appointment.lastReminderSent
          ? new Date(appointment.lastReminderSent)
          : null;
        const today = new Date().toISOString().split("T")[0];

        if (
          lastReminderSent &&
          lastReminderSent.toISOString().split("T")[0] === today
        ) {
          results.push({
            appointmentId: appointment._id,
            status: "skipped",
            reason: "Reminder already sent today",
          });
          continue;
        }

        // Send reminder
        const result = await sendAppointmentReminder({
          email: appointment.owner,
          petName: appointment.petName,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          location: appointment.location,
          reason: appointment.reason,
        });

        if (result.success) {
          // Update last reminder sent timestamp
          await Appointment.findByIdAndUpdate(appointment._id, {
            lastReminderSent: new Date(),
          });

          results.push({
            appointmentId: appointment._id,
            status: "sent",
            email: appointment.owner,
          });
        } else {
          results.push({
            appointmentId: appointment._id,
            status: "failed",
            reason: "Email sending failed",
          });
        }
      } catch (error) {
        console.error(
          `Error processing appointment ${appointment._id}:`,
          error
        );
        results.push({
          appointmentId: appointment._id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      appointmentsChecked: upcomingAppointments.length,
      results,
    });
  } catch (error) {
    console.error("Error checking upcoming appointments:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
