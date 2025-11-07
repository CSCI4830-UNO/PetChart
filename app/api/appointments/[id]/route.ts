import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongoose";
import Appointment from "@/models/Appointment";
import Pet from "@/models/Pet";

interface Params {
    id: string;
}

// GET /api/appointments/[id] - Get specific appointment
export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const appointment = await Appointment.findOne({ 
            _id: params.id, 
            owner: session.user.email 
        }).populate('petId', 'name species breed');

        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Error fetching appointment:", error);
        return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
    }
}

// PUT /api/appointments/[id] - Update appointment
export async function PUT(request: NextRequest, { params }: { params: Params }) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { petId, appointmentDate, appointmentTime, location, reason, notes, status } = body;

        // Find existing appointment
        const appointment = await Appointment.findOne({ 
            _id: params.id, 
            owner: session.user.email 
        });

        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        // If petId is being changed, verify new pet belongs to user
        if (petId && petId !== appointment.petId.toString()) {
            const pet = await Pet.findOne({ _id: petId, owner: session.user.email });
            if (!pet) {
                return NextResponse.json({ error: "Pet not found or not owned by user" }, { status: 404 });
            }
            appointment.petId = petId;
            appointment.petName = pet.name;
        }

        // Update fields
        if (appointmentDate) appointment.appointmentDate = new Date(appointmentDate);
        if (appointmentTime) appointment.appointmentTime = appointmentTime;
        if (location) appointment.location = location;
        if (reason) appointment.reason = reason;
        if (notes !== undefined) appointment.notes = notes;
        if (status) appointment.status = status;

        await appointment.save();

        // Populate pet information before returning
        await appointment.populate('petId', 'name species breed');

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Error updating appointment:", error);
        return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
    }
}

// DELETE /api/appointments/[id] - Delete appointment
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const appointment = await Appointment.findOneAndDelete({ 
            _id: params.id, 
            owner: session.user.email 
        });

        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Appointment deleted successfully" });
    } catch (error) {
        console.error("Error deleting appointment:", error);
        return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
    }
}