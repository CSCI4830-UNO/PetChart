"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Stethoscope, ArrowLeft, PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface Pet {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    age: number;
}

export default function ScheduleAppointment() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        petId: "",
        appointmentDate: "",
        appointmentTime: "",
        location: "",
        reason: "",
        notes: ""
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    // Fetch user's pets
    useEffect(() => {
        const fetchPets = async () => {
            if (!session?.user?.email) return;

            try {
                const response = await fetch("/api/pets");
                if (response.ok) {
                    const data = await response.json();
                    setPets(data);
                } else {
                    toast.error("Failed to load pets");
                }
            } catch (error) {
                console.error("Error fetching pets:", error);
                toast.error("Failed to load pets");
            }
        };

        fetchPets();
    }, [session]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate form
            if (!formData.petId || !formData.appointmentDate || !formData.appointmentTime || 
                !formData.location || !formData.reason) {
                toast.error("Please fill in all required fields");
                return;
            }

            // Validate date is in the future
            const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
            if (appointmentDateTime <= new Date()) {
                toast.error("Appointment must be scheduled for a future date and time");
                return;
            }

            const response = await fetch("/api/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Appointment scheduled successfully!");
                router.push("/appointments");
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to schedule appointment");
            }
        } catch (error) {
            console.error("Error scheduling appointment:", error);
            toast.error("Failed to schedule appointment");
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = () => {
        if (!formData.appointmentDate || !formData.appointmentTime) return "";
        const date = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="mr-4"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Calendar size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Schedule Appointment</h1>
                                <p className="text-sm text-gray-600">Book a future appointment for your pet</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Form */}
                        <div className="space-y-6">
                            {/* Pet Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Stethoscope size={20} className="text-blue-600" />
                                        Pet Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="pet">Select Pet *</Label>
                                            <Select 
                                                value={formData.petId} 
                                                onValueChange={(value) => handleInputChange("petId", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a pet" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {pets.map((pet) => (
                                                        <SelectItem key={pet._id} value={pet._id}>
                                                            {pet.name} - {pet.breed ? `${pet.breed} ` : ""}{pet.species}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {pets.length === 0 && (
                                            <div className="text-center py-4 text-gray-500">
                                                <PlusCircle size={24} className="mx-auto mb-2 text-gray-400" />
                                                <p className="text-sm">No pets found. Add a pet first to schedule appointments.</p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => router.push("/pets/add")}
                                                >
                                                    Add Pet
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Date & Time */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock size={20} className="text-green-600" />
                                        Date & Time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="date">Appointment Date *</Label>
                                            <Input
                                                type="date"
                                                id="date"
                                                value={formData.appointmentDate}
                                                onChange={(e) => handleInputChange("appointmentDate", e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="time">Appointment Time *</Label>
                                            <Input
                                                type="time"
                                                id="time"
                                                value={formData.appointmentTime}
                                                onChange={(e) => handleInputChange("appointmentTime", e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location & Reason */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin size={20} className="text-purple-600" />
                                        Appointment Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="location">Location/Clinic *</Label>
                                            <Input
                                                type="text"
                                                id="location"
                                                value={formData.location}
                                                onChange={(e) => handleInputChange("location", e.target.value)}
                                                placeholder="e.g., City Animal Hospital, 123 Main St"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="reason">Reason for Visit *</Label>
                                            <Input
                                                type="text"
                                                id="reason"
                                                value={formData.reason}
                                                onChange={(e) => handleInputChange("reason", e.target.value)}
                                                placeholder="e.g., Annual checkup, Vaccination, Dental cleaning"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="notes">Additional Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={(e) => handleInputChange("notes", e.target.value)}
                                                placeholder="Any additional information or special instructions..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Preview */}
                        <div className="space-y-6">
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle>Appointment Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {formData.petId && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Pet</h4>
                                                <p className="text-gray-600">
                                                    {pets.find(p => p._id === formData.petId)?.name || "Unknown"}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {formatDateTime() && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Date & Time</h4>
                                                <p className="text-gray-600">{formatDateTime()}</p>
                                            </div>
                                        )}
                                        
                                        {formData.location && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Location</h4>
                                                <p className="text-gray-600">{formData.location}</p>
                                            </div>
                                        )}
                                        
                                        {formData.reason && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Reason</h4>
                                                <p className="text-gray-600">{formData.reason}</p>
                                            </div>
                                        )}
                                        
                                        {formData.notes && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Notes</h4>
                                                <p className="text-gray-600">{formData.notes}</p>
                                            </div>
                                        )}

                                        {!formData.petId && !formData.appointmentDate && (
                                            <div className="text-center py-8 text-gray-400">
                                                <Calendar size={48} className="mx-auto mb-4" />
                                                <p>Fill in the form to see appointment preview</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || pets.length === 0}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? "Scheduling..." : "Schedule Appointment"}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}