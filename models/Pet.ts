import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface for a Pet
export interface Pet extends Document {
    name: string;
    species: string;
    breed?: string;
    age: number;
    weight?: number;
    color?: string;
    microchipId?: string;
    birthday?: Date;
    dateAdded: Date;
    owner: string; // User's email or ID
    medicalHistory: {
        vaccinations: Array<{
            vaccine: string;
            date: Date;
            nextDue?: Date;
        }>;
        treatments: Array<{
            treatment: string;
            date: Date;
            notes?: string;
        }>;
        medications: Array<{
            medication: string;
            dosage: string;
            startDate: Date;
            endDate?: Date;
            notes?: string;
        }>;
    };
    photos?: string[];
    notes?: string;
}

// Create Mongoose schema from interface
const PetSchema = new Schema<Pet>(
    {
        name: { type: String, required: true },
        species: { type: String, required: true },
        breed: { type: String },
        age: { type: Number, required: true },
        weight: { type: Number },
        color: { type: String },
        microchipId: { type: String },
        birthday: { type: Date },
        dateAdded: { type: Date, default: Date.now },
        owner: { type: String, required: true },
        medicalHistory: {
            vaccinations: [{
                vaccine: { type: String, required: true },
                date: { type: Date, required: true },
                nextDue: { type: Date }
            }],
            treatments: [{
                treatment: { type: String, required: true },
                date: { type: Date, required: true },
                notes: { type: String }
            }],
            medications: [{
                medication: { type: String, required: true },
                dosage: { type: String, required: true },
                startDate: { type: Date, required: true },
                endDate: { type: Date },
                notes: { type: String }
            }]
        },
        photos: [{ type: String }],
        notes: { type: String }
    },
    {
        timestamps: true
    }
);

// Prevent model recompilation in development
export default mongoose.models.Pet || mongoose.model<Pet>("Pet", PetSchema);