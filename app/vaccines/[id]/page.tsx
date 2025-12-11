"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Syringe, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Vaccination {
    _id?: string;
    vaccine: string;
    date: string;
    nextDue?: string;
}

interface Pet {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    medicalHistory: {
        vaccinations: Vaccination[];
    };
}

export default function VaccineHistory() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const petId = params.id as string;

    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    // Fetch pet data
    useEffect(() => {
        const fetchPet = async () => {
            if (!session?.user?.email || !petId) return;

            try {
                const response = await fetch(`/api/pets/${petId}`);
                if (response.ok) {
                    const data = await response.json();
                    setPet(data);
                } else {
                    toast.error("Failed to load pet");
                    router.push("/pets");
                }
            } catch (error) {
                console.error("Error fetching pet:", error);
                toast.error("Failed to load pet");
                router.push("/pets");
            } finally {
                setLoading(false);
            }
        };

        fetchPet();
    }, [session, petId, router]);

    const handleDeleteVaccination = async (vaccinationIndex: number) => {
        if (!confirm("Are you sure you want to delete this vaccination record?")) {
            return;
        }

        setDeleting(`vac-${vaccinationIndex}`);

        try {
            const vaccinations = pet!.medicalHistory.vaccinations.filter((_, i) => i !== vaccinationIndex);
            
            const response = await fetch(`/api/pets/${petId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: pet!.name,
                    species: pet!.species,
                    breed: (pet as any).breed,
                    age: (pet as any).age,
                    weight: (pet as any).weight,
                    color: (pet as any).color,
                    microchipId: (pet as any).microchipId,
                    birthday: (pet as any).birthday,
                    notes: (pet as any).notes,
                    medicalHistory: {
                        ...pet!.medicalHistory,
                        vaccinations
                    }
                }),
            });

            if (response.ok) {
                // Re-fetch the pet to ensure we have the latest data
                const fetchResponse = await fetch(`/api/pets/${petId}`);
                if (fetchResponse.ok) {
                    const updated = await fetchResponse.json();
                    setPet(updated);
                }
                toast.success("Vaccination record deleted");
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to delete vaccination");
            }
        } catch (error) {
            console.error("Error deleting vaccination:", error);
            toast.error("Failed to delete vaccination");
        } finally {
            setDeleting(null);
        }
    };

    const handleSendVaccineReminder = async (vaccineIndex: number) => {
        try {
            const response = await fetch("/api/notifications/send-vaccination-reminder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ petId, vaccineIndex }),
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
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const isUpcomingVaccine = (vaccination: Vaccination) => {
        if (!vaccination.nextDue) return false;
        const now = new Date();
        const nextDueDate = new Date(vaccination.nextDue);
        return nextDueDate > now;
    };

    const isDueOrOverdue = (vaccination: Vaccination) => {
        if (!vaccination.nextDue) return false;
        const now = new Date();
        const nextDueDate = new Date(vaccination.nextDue);
        return nextDueDate <= now;
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#18191a] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session || !pet) {
        return null;
    }

    const vaccinations = pet.medicalHistory.vaccinations || [];
    const upcomingVaccines = vaccinations.filter(isUpcomingVaccine);
    const dueVaccines = vaccinations.filter(isDueOrOverdue);
    const completedVaccines = vaccinations.filter(v => !isUpcomingVaccine(v) && !isDueOrOverdue(v));

    return (
        <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#18191a]">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-gray-200/70 dark:border-[#3a3b3c]/70 bg-white/80 dark:bg-[#242526]/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#242526]/60">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Vaccination History</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and manage vaccinations for {pet.name}</p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                            aria-label="Close"
                        >
                            <ArrowLeft size={24} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
                {vaccinations.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">💉</div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No vaccinations</h3>
                        <p className="text-gray-600 mb-8">No vaccination records found for {pet.name}.</p>
                        <Button
                            onClick={() => router.push(`/vaccines/add/${petId}`)}
                            className="bg-gray-900 hover:bg-black text-white rounded-full px-6"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Vaccination
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Due or Overdue Vaccines */}
                        {dueVaccines.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold text-red-900 mb-4">Due or Overdue</h2>
                                <div className="space-y-4">
                                    {dueVaccines.map((vaccination, index) => (
                                        <div key={index} className="rounded-2xl border border-red-200/50 bg-red-50/50 p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-xl font-semibold text-gray-900">{vaccination.vaccine}</h3>
                                                        <Badge className="bg-red-100 text-red-800 border-red-200 rounded-full px-3 py-1 text-xs font-medium">
                                                            Due
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-gray-500">Last Given</p>
                                                            <p className="text-gray-900 mt-1">{formatDate(vaccination.date)}</p>
                                                        </div>
                                                        {vaccination.nextDue && (
                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-gray-500">Due Date</p>
                                                                <p className="text-red-600 font-semibold mt-1">{formatDate(vaccination.nextDue)}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSendVaccineReminder(vaccinations.indexOf(vaccination))}
                                                        className="text-blue-600 hover:text-blue-700 transition-colors p-2"
                                                        aria-label="Send reminder"
                                                        title="Send reminder email"
                                                    >
                                                        📧
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteVaccination(vaccinations.indexOf(vaccination))}
                                                        disabled={deleting === `vac-${vaccinations.indexOf(vaccination)}`}
                                                        className="text-red-600 hover:text-red-700 transition-colors p-2"
                                                        aria-label="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Vaccines */}
                        {upcomingVaccines.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold text-blue-900 mb-4">Upcoming</h2>
                                <div className="space-y-4">
                                    {upcomingVaccines.map((vaccination, index) => (
                                        <div key={dueVaccines.length + index} className="rounded-2xl border border-blue-200/50 bg-blue-50/50 p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-xl font-semibold text-gray-900">{vaccination.vaccine}</h3>
                                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 rounded-full px-3 py-1 text-xs font-medium">
                                                            Upcoming
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-gray-500">Last Given</p>
                                                            <p className="text-gray-900 mt-1">{formatDate(vaccination.date)}</p>
                                                        </div>
                                                        {vaccination.nextDue && (
                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-gray-500">Next Due</p>
                                                                <p className="text-blue-600 font-semibold mt-1">{formatDate(vaccination.nextDue)}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSendVaccineReminder(vaccinations.indexOf(vaccination))}
                                                        className="text-blue-600 hover:text-blue-700 transition-colors p-2"
                                                        aria-label="Send reminder"
                                                        title="Send reminder email"
                                                    >
                                                        📧
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteVaccination(vaccinations.indexOf(vaccination))}
                                                        disabled={deleting === `vac-${vaccinations.indexOf(vaccination)}`}
                                                        className="text-red-600 hover:text-red-700 transition-colors p-2"
                                                        aria-label="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed Vaccines */}
                        {completedVaccines.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vaccination Records</h2>
                                <div className="space-y-4">
                                    {completedVaccines.map((vaccination, index) => (
                                        <div key={dueVaccines.length + upcomingVaccines.length + index} className="rounded-2xl border border-gray-200/80 bg-white p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{vaccination.vaccine}</h3>
                                                    <div className="space-y-2 text-sm">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-gray-500">Date Given</p>
                                                            <p className="text-gray-900 mt-1">{formatDate(vaccination.date)}</p>
                                                        </div>
                                                        {vaccination.nextDue && (
                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-gray-500">Next Due</p>
                                                                <p className="text-gray-600 mt-1">{formatDate(vaccination.nextDue)}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteVaccination(vaccinations.indexOf(vaccination))}
                                                    disabled={deleting === `vac-${vaccinations.indexOf(vaccination)}`}
                                                    className="text-red-600 hover:text-red-700 transition-colors p-2"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add Button */}
                        <Button
                            onClick={() => router.push(`/vaccines/add/${petId}`)}
                            className="w-full bg-gray-900 hover:bg-black text-white rounded-lg py-3"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Vaccination
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
