import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongoose";
import Appointment from "@/models/Appointment";
import Pet from "@/models/Pet";

// GET /api/appointments - Get all appointments for the user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const petId = searchParams.get('petId');
        const status = searchParams.get('status');
        const date = searchParams.get('date');

        // Build query
        let query: any = { owner: session.user.email };
        
        if (petId) {
            query.petId = petId;
        }
        
        if (status) {
            query.status = status;
        }
        
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.appointmentDate = {
                $gte: startDate,
                $lt: endDate
            };
        }

        const appointments = await Appointment.find(query)
            .populate('petId', 'name species breed')
            .sort({ appointmentDate: 1, appointmentTime: 1 });

        return NextResponse.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
    }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { petId, appointmentDate, appointmentTime, location, reason, notes } = body;

        // Validate required fields
        if (!petId || !appointmentDate || !appointmentTime || !location || !reason) {
            return NextResponse.json({ 
                error: "Missing required fields: petId, appointmentDate, appointmentTime, location, reason" 
            }, { status: 400 });
        }

        // Verify pet belongs to user
        const pet = await Pet.findOne({ _id: petId, owner: session.user.email });
        if (!pet) {
            return NextResponse.json({ error: "Pet not found or not owned by user" }, { status: 404 });
        }

        // Create new appointment
        const appointment = new Appointment({
            petId,
            petName: pet.name,
            owner: session.user.email,
            appointmentDate: new Date(appointmentDate),
            appointmentTime,
            location,
            reason,
            notes,
            status: 'scheduled'
        });

        await appointment.save();

        // Populate pet information before returning
        await appointment.populate('petId', 'name species breed');

        return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
    }
}