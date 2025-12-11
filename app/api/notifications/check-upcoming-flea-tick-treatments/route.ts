import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Pet from "@/models/Pet";
import User from "@/models/User";
import { sendFleaTickReminder } from "@/lib/email";

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const pets = await Pet.find({
      "medicalHistory.fleaTickTreatments": { $exists: true, $ne: [] },
    });

    const results = [];
    const debugInfo = [];

    for (const pet of pets) {
      try {
        const user = await User.findOne({ email: pet.owner });

        if (!user) {
          debugInfo.push({
            petName: pet.name,
            issue: "User not found",
            owner: pet.owner,
          });
          continue;
        }

        if (!user.notificationPreferences?.fleaTickReminders) {
          debugInfo.push({
            petName: pet.name,
            issue: "Flea & tick reminders disabled",
            owner: pet.owner,
          });
          continue;
        }

        for (let i = 0; i < pet.medicalHistory.fleaTickTreatments.length; i++) {
          const treatment = pet.medicalHistory.fleaTickTreatments[i];

          if (!treatment.nextDue) {
            debugInfo.push({
              petName: pet.name,
              treatment: treatment.treatment,
              issue: "No nextDue date set",
            });
            continue;
          }

          const nextDueDate = new Date(treatment.nextDue);

          debugInfo.push({
            petName: pet.name,
            treatment: treatment.treatment,
            nextDue: treatment.nextDue,
            daysFromNow: Math.ceil(
              (nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            ),
          });

          if (nextDueDate <= sevenDaysFromNow) {
            const lastReminderSent = treatment.lastReminderSent
              ? new Date(treatment.lastReminderSent)
              : null;

            if (lastReminderSent) {
              const daysSinceLastReminder =
                (now.getTime() - lastReminderSent.getTime()) /
                (1000 * 60 * 60 * 24);

              if (daysSinceLastReminder < 3) {
                results.push({
                  petId: pet._id,
                  petName: pet.name,
                  treatment: treatment.treatment,
                  status: "skipped",
                  reason: "Reminder sent within last 3 days",
                });
                continue;
              }
            }

            const daysUntilDue = Math.ceil(
              (nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            const result = await sendFleaTickReminder({
              email: pet.owner,
              petName: pet.name,
              treatment: treatment.treatment,
              nextDueDate: treatment.nextDue as any,
              daysUntilDue,
            });

            if (result.success) {
              pet.medicalHistory.fleaTickTreatments[i].lastReminderSent = new Date();
              await pet.save();

              results.push({
                petId: pet._id,
                petName: pet.name,
                treatment: treatment.treatment,
                status: "sent",
                email: pet.owner,
                daysUntilDue,
              });
            } else {
              results.push({
                petId: pet._id,
                petName: pet.name,
                treatment: treatment.treatment,
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
    console.error("Error checking upcoming flea & tick treatments:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
