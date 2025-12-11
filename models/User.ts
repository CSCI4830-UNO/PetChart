import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface for a User
export interface User extends Document {
    name: string;
    email: string;
    theme?: "light" | "dark" | "system";
    notificationPreferences?: {
        appointmentReminders?: boolean;
        vaccinationReminders?: boolean;
        fleaTickReminders?: boolean;
    };
}
// Create Mongoose schema from interface
const UserSchema = new Schema<User>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
        notificationPreferences: {
            appointmentReminders: { type: Boolean, default: true },
            vaccinationReminders: { type: Boolean, default: true },
            fleaTickReminders: { type: Boolean, default: true }
        }
    }
);

// Prevent model recompilation in development
export default mongoose.models.User || mongoose.model<User>("User", UserSchema);