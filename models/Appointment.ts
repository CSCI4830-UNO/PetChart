import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface for an Appointment
export interface Appointment extends Document {
    petId: mongoose.Types.ObjectId; // Reference to Pet document
    petName: string; // Pet's name for easy reference
    owner: string; // User's email or ID
    appointmentDate: Date;
    appointmentTime: string; // Time in HH:MM format
    location: string; // Veterinary clinic or location
    reason: string; // Reason for the appointment
    notes?: string; // Additional notes
    status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
    reminderSent?: boolean; // For future reminder functionality
    createdAt: Date;
    updatedAt: Date;
}

// Create Mongoose schema from interface
const AppointmentSchema = new Schema<Appointment>(
    {
        petId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Pet',
            required: true 
        },
        petName: { 
            type: String, 
            required: true 
        },
        owner: { 
            type: String, 
            required: true 
        },
        appointmentDate: { 
            type: Date, 
            required: true 
        },
        appointmentTime: { 
            type: String, 
            required: true,
            validate: {
                validator: function(v: string) {
                    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Time must be in HH:MM format'
            }
        },
        location: { 
            type: String, 
            required: true 
        },
        reason: { 
            type: String, 
            required: true 
        },
        notes: { 
            type: String 
        },
        status: { 
            type: String, 
            enum: ['scheduled', 'completed', 'cancelled', 'missed'],
            default: 'scheduled'
        },
        reminderSent: { 
            type: Boolean, 
            default: false 
        }
    },
    {
        timestamps: true
    }
);

// Create indexes for better query performance
AppointmentSchema.index({ owner: 1, appointmentDate: 1 });
AppointmentSchema.index({ petId: 1 });
AppointmentSchema.index({ appointmentDate: 1, status: 1 });

// Prevent model recompilation in development
export default mongoose.models.Appointment || mongoose.model<Appointment>("Appointment", AppointmentSchema);