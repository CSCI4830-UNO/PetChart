import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface for a User
export interface User extends Document {
    name: string;
    email: string;
}
// Create Mongoose schema from interface
const UserSchema = new Schema<User>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true }
    }
);

// Prevent model recompilation in development
export default mongoose.models.User || mongoose.model<User>("User", UserSchema);