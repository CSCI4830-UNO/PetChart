"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Syringe } from "lucide-react";
import { toast } from "sonner";

interface Pet {
    _id: string;
    name: string;
    species: string;
    breed?: string;
}

export default function AddVaccine() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const petId = params.id as string;

    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        vaccine: "",
        date: "",
        nextDue: ""
    });

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
                setFetching(false);
            }
        };

        fetchPet();
    }, [session, petId, router]);

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
            if (!formData.vaccine || !formData.date) {
                toast.error("Please fill in all required fields");
                return;
            }

            const response = await fetch(`/api/pets/${petId}/vaccines`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    vaccine: formData.vaccine,
                    date: formData.date,
                    nextDue: formData.nextDue || undefined
                }),
            });

            if (response.ok) {
                toast.success("Vaccination record added successfully!");
                router.push(`/vaccines/${petId}`);
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to add vaccination");
            }
        } catch (error) {
            console.error("Error adding vaccination:", error);
            toast.error("Failed to add vaccination");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || fetching) {
        return (
            <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session || !pet) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7]">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900">Add Vaccination</h1>
                            <p className="text-sm text-gray-600 mt-1">Record a vaccination for {pet.name}</p>
                        </div>
                        <button
                            onClick={() => router.push("/")}
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
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Pet Info */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Pet</h3>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500">Pet Name</p>
                                    <p className="text-lg font-semibold text-gray-900 mt-2">{pet.name}</p>
                                    <p className="text-sm text-gray-600 mt-1">{pet.breed ? `${pet.breed} ` : ""}{pet.species}</p>
                                </div>
                            </div>

                            {/* Vaccination Details */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Vaccination Details</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="vaccine" className="text-sm font-medium text-gray-700">Vaccine Name *</Label>
                                        <Input
                                            type="text"
                                            id="vaccine"
                                            value={formData.vaccine}
                                            onChange={(e) => handleInputChange("vaccine", e.target.value)}
                                            placeholder="e.g., DHPP, Rabies, Bordetella"
                                            required
                                            className="mt-2 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="date" className="text-sm font-medium text-gray-700">Vaccination Date *</Label>
                                        <Input
                                            type="date"
                                            id="date"
                                            value={formData.date}
                                            onChange={(e) => handleInputChange("date", e.target.value)}
                                            required
                                            className="mt-2 rounded-xl border-gray-200 bg-white text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="nextDue" className="text-sm font-medium text-gray-700">Next Due Date</Label>
                                        <Input
                                            type="date"
                                            id="nextDue"
                                            value={formData.nextDue}
                                            onChange={(e) => handleInputChange("nextDue", e.target.value)}
                                            className="mt-2 rounded-xl border-gray-200 bg-white text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Preview */}
                        <div>
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 sticky top-20">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                                <div className="space-y-4">
                                    {formData.vaccine && (
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-gray-500">Vaccine</p>
                                            <p className="text-gray-900 font-medium mt-1">{formData.vaccine}</p>
                                        </div>
                                    )}
                                    {formData.date && (
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-gray-500">Date</p>
                                            <p className="text-gray-900 font-medium mt-1">
                                                {new Date(formData.date).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {formData.nextDue && (
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-gray-500">Next Due</p>
                                            <p className="text-gray-900 font-medium mt-1">
                                                {new Date(formData.nextDue).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {!formData.vaccine && !formData.date && (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-gray-500">Fill in the form to see preview</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/")}
                            className="rounded-lg text-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            {loading ? "Adding..." : "Add Vaccination"}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
