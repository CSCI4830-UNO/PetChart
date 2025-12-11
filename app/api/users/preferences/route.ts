import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

// GET user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      theme: user.theme || "system",
      notificationPreferences: user.notificationPreferences || {
        appointmentReminders: true,
        vaccinationReminders: true,
        fleaTickReminders: true,
      },
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// PUT update user preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { notificationPreferences, theme } = body;

    const updateData: any = {};
    if (notificationPreferences) {
      updateData.notificationPreferences = notificationPreferences;
    }
    if (theme && ["light", "dark", "system"].includes(theme)) {
      updateData.theme = theme;
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      theme: user.theme,
      notificationPreferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
