"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Plus, Edit3, Trash2, PawPrint } from "lucide-react";
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
        const appointmentDateTime = new Date(`${dateString}T${timeString}`);
        return appointmentDateTime > new Date();
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
                return upcoming && appointment.status === 'scheduled';
            case 'past':
                return !upcoming || appointment.status !== 'scheduled';
            default:
                return true;
        }
    });

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/")}
                                className="mr-2"
                            >
                                <PawPrint size={20} className="mr-2" />
                                Back to Dashboard
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                                <p className="text-sm text-gray-600">Manage your pet appointments</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => router.push("/appointments/schedule")}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus size={20} className="mr-2" />
                            Schedule Appointment
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filter Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === 'upcoming'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === 'past'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Past
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === 'all'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        All
                    </button>
                </div>

                {/* Appointments List */}
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                        <p className="text-gray-500 mb-4">
                            {filter === 'upcoming' 
                                ? "You don't have any upcoming appointments."
                                : filter === 'past'
                                ? "You don't have any past appointments."
                                : "You haven't scheduled any appointments yet."
                            }
                        </p>
                        <Button
                            onClick={() => router.push("/appointments/schedule")}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus size={20} className="mr-2" />
                            Schedule Your First Appointment
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAppointments.map((appointment) => (
                            <Card key={appointment._id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Left side - Appointment Info */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {appointment.petName}
                                                </h3>
                                                <Badge className={getStatusColor(appointment.status)}>
                                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    <span>{formatDate(appointment.appointmentDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} />
                                                    <span>{formatTime(appointment.appointmentTime)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} />
                                                    <span>{appointment.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Reason:</span>
                                                    <span>{appointment.reason}</span>
                                                </div>
                                            </div>
                                            {appointment.notes && (
                                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                    <span className="font-medium">Notes:</span> {appointment.notes}
                                                </p>
                                            )}
                                        </div>

                                        {/* Right side - Actions */}
                                        <div className="flex flex-col gap-2 lg:items-end">
                                            {appointment.status === 'scheduled' && isUpcoming(appointment.appointmentDate, appointment.appointmentTime) && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                                                    >
                                                        Mark Complete
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/appointments/edit/${appointment._id}`)}
                                                >
                                                    <Edit3 size={16} className="mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteAppointment(appointment._id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} className="mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}