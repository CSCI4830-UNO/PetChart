"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Pill, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Defines Medication and Pet types
interface Medication {
    _id?: string;
    medication: string;
    dosage: string;
    startDate: string;
    endDate?: string;
    notes?: string;
}
// Defines Pet type
interface Pet {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    medicalHistory: {
        medications: Medication[];
    };
}

// Main component for displaying medication history
export default function MedicationHistory() {
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

    const handleDeleteMedication = async (medicationIndex: number) => {
        if (!confirm("Are you sure you want to delete this medication record?")) {
            return;
        }

        setDeleting(`med-${medicationIndex}`);

        try {
            const medications = pet!.medicalHistory.medications.filter((_, i) => i !== medicationIndex);
            
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
                        medications
                    }
                }),
            });

            if (response.ok) {
                // Re-fetch the pet to ensure latest data
                const fetchResponse = await fetch(`/api/pets/${petId}`);
                if (fetchResponse.ok) {
                    const updated = await fetchResponse.json();
                    setPet(updated);
                }
                toast.success("Medication record deleted");
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to delete medication");
            }
        } catch (error) {
            console.error("Error deleting medication:", error);
            toast.error("Failed to delete medication");
        } finally {
            setDeleting(null);
        }
    };
    // reformats date strings
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };
    // checks if medication is currently active
    const isActiveMedication = (medication: Medication) => {
        const now = new Date();
        const startDate = new Date(medication.startDate);
        const endDate = medication.endDate ? new Date(medication.endDate) : null;

        return startDate <= now && (!endDate || endDate >= now);
    };
    // Displays loading state
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

    // separates active and inactive medications
    const medications = pet.medicalHistory.medications || [];
    const activeMedications = medications.filter(isActiveMedication);
    const inactiveMedications = medications.filter(m => !isActiveMedication(m));

    // Displays the main component
    return (
        <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#18191a]">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-gray-200/70 dark:border-[#3a3b3c]/70 bg-white/80 dark:bg-[#242526]/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#242526]/60">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Medication History</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and manage medications for {pet.name}</p>
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
                {medications.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">💊</div>
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No medications</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">No medication records found for {pet.name}.</p>
                        <Button
                            onClick={() => router.push(`/medications/add?petId=${petId}`)}
                            className="bg-gray-900 hover:bg-black text-white rounded-full px-6"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Medication
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Active Medications */}
                        {activeMedications.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Current Medications</h2>
                                <div className="space-y-4">
                                    {activeMedications.map((medication, index) => (
                                        <div key={index} className="rounded-2xl border border-green-200/50 bg-green-50/50 p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-xl font-semibold text-gray-900">{medication.medication}</h3>
                                                        <Badge className="bg-green-100 text-green-800 border-green-200 rounded-full px-3 py-1 text-xs font-medium">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-gray-500">Dosage</p>
                                                            <p className="text-gray-900 font-medium mt-1">{medication.dosage}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-gray-500">Start Date</p>
                                                            <p className="text-gray-900 mt-1">{formatDate(medication.startDate)}</p>
                                                        </div>
                                                        {medication.notes && (
                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-gray-500">Notes</p>
                                                                <p className="text-gray-600 mt-1">{medication.notes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteMedication(index)}
                                                    disabled={deleting === `med-${index}`}
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

                        {/* Inactive Medications */}
                        {inactiveMedications.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Past Medications</h2>
                                <div className="space-y-4">
                                    {inactiveMedications.map((medication, index) => (
                                        <div key={activeMedications.length + index} className="rounded-2xl border border-gray-200/80 bg-white p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-xl font-semibold text-gray-900">{medication.medication}</h3>
                                                        <Badge className="bg-gray-100 text-gray-800 border-gray-200 rounded-full px-3 py-1 text-xs font-medium">
                                                            Completed
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-gray-500">Dosage</p>
                                                            <p className="text-gray-900 font-medium mt-1">{medication.dosage}</p>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-gray-500">Start Date</p>
                                                                <p className="text-gray-900 mt-1">{formatDate(medication.startDate)}</p>
                                                            </div>
                                                            {medication.endDate && (
                                                                <div>
                                                                    <p className="text-xs uppercase tracking-wide text-gray-500">End Date</p>
                                                                    <p className="text-gray-900 mt-1">{formatDate(medication.endDate)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {medication.notes && (
                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-gray-500">Notes</p>
                                                                <p className="text-gray-600 mt-1">{medication.notes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteMedication(activeMedications.length + index)}
                                                    disabled={deleting === `med-${activeMedications.length + index}`}
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
                            onClick={() => router.push(`/medications/add?petId=${petId}`)}
                            className="w-full bg-gray-900 hover:bg-black text-white rounded-lg py-3"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Medication
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
