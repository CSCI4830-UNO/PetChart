"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Plus, Edit3, Trash2, PawPrint, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Appointment {
    _id: string;
    petId: {
        _id: string;
        name: string;
        species: string;
        breed?: string;
    };
    petName: string;
    appointmentDate: string;
    appointmentTime: string;
    location: string;
    reason: string;
    notes?: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
    createdAt: string;
}

export default function Appointments() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    // Fetch appointments
    useEffect(() => {
        const fetchAppointments = async () => {
            if (!session?.user?.email) return;

            try {
                const response = await fetch("/api/appointments");
                if (response.ok) {
                    const data = await response.json();
                    setAppointments(data);
                } else {
                    toast.error("Failed to load appointments");
                }
            } catch (error) {
                console.error("Error fetching appointments:", error);
                toast.error("Failed to load appointments");
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [session]);

    const handleDeleteAppointment = async (appointmentId: string) => {
        if (!confirm("Are you sure you want to delete this appointment?")) {
            return;
        }

        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
                toast.success("Appointment deleted successfully");
            } else {
                toast.error("Failed to delete appointment");
            }
        } catch (error) {
            console.error("Error deleting appointment:", error);
            toast.error("Failed to delete appointment");
        }
    };

    const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                const updatedAppointment = await response.json();
                setAppointments(prev => 
                    prev.map(apt => 
                        apt._id === appointmentId ? updatedAppointment : apt
                    )
                );
                toast.success("Appointment status updated");
            } else {
                toast.error("Failed to update appointment status");
            }
        } catch (error) {
            console.error("Error updating appointment:", error);
            toast.error("Failed to update appointment status");
        }
    };

    const handleSendReminder = async (appointmentId: string) => {
        try {
            const response = await fetch("/api/notifications/send-appointment-reminder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ appointmentId }),
            });

            if (response.ok) {
                toast.success("Reminder sent successfully!");
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to send reminder");
            }
        } catch (error) {
            console.error("Error sending reminder:", error);
            toast.error("Failed to send reminder");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const isUpcoming = (dateString: string, timeString: string) => {
        // Parse the date string - handle both ISO format and simple date format
        const datePart = dateString.split('T')[0]; // Get just the date part if ISO format
        const appointmentDateTime = new Date(`${datePart}T${timeString}`);
        const now = new Date();
        
        // Compare dates in local timezone to avoid offset issues
        appointmentDateTime.setHours(appointmentDateTime.getHours(), appointmentDateTime.getMinutes(), 0, 0);
        now.setHours(now.getHours(), now.getMinutes(), 0, 0);
        
        return appointmentDateTime > now;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'missed':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredAppointments = appointments.filter(appointment => {
        const upcoming = isUpcoming(appointment.appointmentDate, appointment.appointmentTime);
        
        switch (filter) {
            case 'upcoming':
                return upcoming;
            case 'past':
                return !upcoming;
            default:
                return true;
        }
    });

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading appointments...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7]">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900">Appointments</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage and schedule your pet's visits</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => router.push("/appointments/schedule")}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            >
                                <Plus size={18} className="mr-2" />
                                Schedule
                            </Button>
                            <button
                                onClick={() => router.push("/")}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                                aria-label="Close"
                            >
                                <ArrowLeft size={24} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-8 border-b border-gray-200/50 pb-4">
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                            filter === 'upcoming'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                            filter === 'past'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Past
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                            filter === 'all'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All
                    </button>
                </div>

                {/* Appointments List */}
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📅</div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No appointments</h3>
                        <p className="text-gray-600 mb-8">
                            {filter === 'upcoming' 
                                ? "You don't have any upcoming appointments."
                                : filter === 'past'
                                ? "You don't have any past appointments."
                                : "You haven't scheduled any appointments yet."
                            }
                        </p>
                        <Button
                            onClick={() => router.push("/appointments/schedule")}
                            className="bg-gray-900 hover:bg-black text-white rounded-full px-6"
                        >
                            <Plus size={18} className="mr-2" />
                            Schedule Your First Appointment
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAppointments.map((appointment) => (
                            <div key={appointment._id} className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                    {/* Left side - Appointment Info */}
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {appointment.petName}
                                            </h3>
                                            <Badge className={`${getStatusColor(appointment.status)} rounded-full px-3 py-1 text-xs font-medium`}>
                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                            </Badge>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Calendar size={18} className="text-gray-400" />
                                                <div>
                                                    <p className="text-gray-600">{formatDate(appointment.appointmentDate)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Clock size={18} className="text-gray-400" />
                                                <div>
                                                    <p className="text-gray-600">{formatTime(appointment.appointmentTime)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <MapPin size={18} className="text-gray-400" />
                                                <div>
                                                    <p className="text-gray-600">{appointment.location}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                <p className="text-gray-500 text-xs uppercase tracking-wide">Reason</p>
                                                <p className="text-gray-900 font-medium">{appointment.reason}</p>
                                            </div>
                                        </div>
                                        {appointment.notes && (
                                            <div className="text-sm">
                                                <p className="text-gray-500 text-xs uppercase tracking-wide">Notes</p>
                                                <p className="text-gray-600">{appointment.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right side - Actions */}
                                    <div className="flex flex-col gap-2 lg:items-end">
                                        {appointment.status === 'scheduled' && isUpcoming(appointment.appointmentDate, appointment.appointmentTime) && (
                                            <div className="flex gap-2 flex-wrap lg:flex-nowrap justify-end">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                                                    className="bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs"
                                                >
                                                    Complete
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                                                    className="bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                        <div className="flex gap-2 justify-end">
                                            {appointment.status === 'scheduled' && isUpcoming(appointment.appointmentDate, appointment.appointmentTime) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleSendReminder(appointment._id)}
                                                    className="text-blue-600 hover:text-blue-700 rounded-lg text-xs"
                                                >
                                                    📧 Remind
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/appointments/edit/${appointment._id}`)}
                                                className="text-gray-600 hover:text-gray-900 rounded-lg text-xs"
                                            >
                                                <Edit3 size={14} className="mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteAppointment(appointment._id)}
                                                className="text-red-600 hover:text-red-700 rounded-lg text-xs"
                                            >
                                                <Trash2 size={14} className="mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}