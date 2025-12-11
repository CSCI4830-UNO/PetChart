import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Pet from "@/models/Pet";
import User from "@/models/User";
import { sendVaccinationReminder } from "@/lib/email";

export async function GET() {
  try {
    await dbConnect();

    // Get current date
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Find all pets with vaccinations
    const pets = await Pet.find({
      "medicalHistory.vaccinations": { $exists: true, $ne: [] },
    });

    const results = [];
    const debugInfo = [];

    for (const pet of pets) {
      try {
        // Get user preferences
        const user = await User.findOne({ email: pet.owner });

        if (!user) {
          debugInfo.push({
            petName: pet.name,
            issue: "User not found",
            owner: pet.owner,
          });
          continue;
        }

        // Check if user has vaccination reminders enabled
        if (!user.notificationPreferences?.vaccinationReminders) {
          debugInfo.push({
            petName: pet.name,
            issue: "Vaccination reminders disabled",
            owner: pet.owner,
          });
          continue;
        }

        // Check each vaccination for upcoming due dates
        for (let i = 0; i < pet.medicalHistory.vaccinations.length; i++) {
          const vaccination = pet.medicalHistory.vaccinations[i];

          if (!vaccination.nextDue) {
            debugInfo.push({
              petName: pet.name,
              vaccine: vaccination.vaccine,
              issue: "No nextDue date set",
            });
            continue;
          }

          const nextDueDate = new Date(vaccination.nextDue);

          debugInfo.push({
            petName: pet.name,
            vaccine: vaccination.vaccine,
            nextDue: vaccination.nextDue,
            daysFromNow: Math.ceil(
              (nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            ),
          });

          // Check if vaccination is due within the next 7 days (or overdue)
          if (nextDueDate <= sevenDaysFromNow) {
            // Check if reminder already sent recently (within last 3 days)
            const lastReminderSent = vaccination.lastReminderSent
              ? new Date(vaccination.lastReminderSent)
              : null;

            if (lastReminderSent) {
              const daysSinceLastReminder =
                (now.getTime() - lastReminderSent.getTime()) /
                (1000 * 60 * 60 * 24);

              if (daysSinceLastReminder < 3) {
                results.push({
                  petId: pet._id,
                  petName: pet.name,
                  vaccine: vaccination.vaccine,
                  status: "skipped",
                  reason: "Reminder sent within last 3 days",
                });
                continue;
              }
            }

            // Calculate days until due
            const daysUntilDue = Math.ceil(
              (nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Send reminder
            const result = await sendVaccinationReminder({
              email: pet.owner,
              petName: pet.name,
              vaccineName: vaccination.vaccine,
              dueDate: vaccination.nextDue,
              daysUntilDue,
            });

            if (result.success) {
              // Update last reminder sent timestamp
              pet.medicalHistory.vaccinations[i].lastReminderSent = new Date();
              await pet.save();

              results.push({
                petId: pet._id,
                petName: pet.name,
                vaccine: vaccination.vaccine,
                status: "sent",
                email: pet.owner,
                daysUntilDue,
              });
            } else {
              results.push({
                petId: pet._id,
                petName: pet.name,
                vaccine: vaccination.vaccine,
                status: "failed",
                reason: "Email sending failed",
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error processing pet ${pet._id}:`, error);
        results.push({
          petId: pet._id,
          petName: pet.name,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      petsChecked: pets.length,
      results,
      debugInfo,
    });
  } catch (error) {
    console.error("Error checking upcoming vaccinations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
