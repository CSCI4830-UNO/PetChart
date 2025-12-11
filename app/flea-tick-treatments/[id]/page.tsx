"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bug, Calendar, Plus, Trash2, ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";

// Defines the FleaTreatment type
interface FleaTreatment {
  treatment: string;
  dosage?: string;
  date: string;
  nextDue?: string;
  prescribingVet?: string;
  notes?: string;
  _id?: string;
}
// Defines the Pet type
interface Pet {
  _id: string;
  name: string;
  species: string;
  breed?: string;
  medicalHistory: {
    fleaTickTreatments: FleaTreatment[];
  };
}

// Main component for displaying flea and tick treatment history
export default function FleaTickTreatmentHistory() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const petId = params.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch pet data including flea and tick treatments
  const fetchPet = async () => {
    try {
      const response = await fetch(`/api/pets/${petId}`);
      if (response.ok) {
        const data = await response.json();
        setPet(data);
      } else {
        toast.error("Failed to load pet");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching pet:", error);
      toast.error("Failed to load pet");
    } finally {
      setLoading(false);
    }
  };
  // Fetches pet data when session or petId changes
  useEffect(() => {
    if (session?.user?.email && petId) {
      fetchPet();
    }
  }, [session, petId]);

  // Handle deletion of a treatment
  const handleDeleteTreatment = async (index: number) => {
    if (!pet || !confirm("Are you sure you want to delete this treatment?")) {
      return;
    }

    try {
      const updatedTreatments = pet.medicalHistory.fleaTickTreatments.filter(
        (_, i) => i !== index
      );

      const response = await fetch(`/api/pets/${petId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: (pet as any).age,
          weight: (pet as any).weight,
          color: (pet as any).color,
          microchipId: (pet as any).microchipId,
          notes: (pet as any).notes,
          medicalHistory: {
            ...pet.medicalHistory,
            fleaTickTreatments: updatedTreatments,
          },
        }),
      });

      if (response.ok) {
        toast.success("Treatment deleted successfully");
        await fetchPet();
      } else {
        toast.error("Failed to delete treatment");
      }
    } catch (error) {
      console.error("Error deleting treatment:", error);
      toast.error("Failed to delete treatment");
    }
  };
  // Formats date to a readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  // Calculates days until next due date
  const getDaysUntilDue = (nextDue: string) => {
    const dueDate = new Date(nextDue);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  // Determines treatment status based on next due date
  const getTreatmentStatus = (nextDue?: string) => {
    if (!nextDue) return null;

    const daysUntil = getDaysUntilDue(nextDue);
    // Returns status label and color based on days until due
    if (daysUntil < 0) {
      return { label: "Overdue", color: "bg-red-100 text-red-800", days: Math.abs(daysUntil) };
    } else if (daysUntil <= 7) {
      return { label: "Due Soon", color: "bg-orange-100 text-orange-800", days: daysUntil };
    } else if (daysUntil <= 30) {
      return { label: "Upcoming", color: "bg-blue-100 text-blue-800", days: daysUntil };
    }

    return { label: "Scheduled", color: "bg-gray-100 text-gray-800", days: daysUntil };
  };
  // Displays loading state
  if (loading || !pet) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#18191a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  // Sort treatments by date descending
  const treatments = pet.medicalHistory?.fleaTickTreatments || [];
  const sortedTreatments = [...treatments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Display the main component
  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#18191a]">
      <header className="sticky top-0 z-40 border-b border-gray-200/70 dark:border-[#3a3b3c]/70 bg-white/80 dark:bg-[#242526]/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#242526]/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                Flea & Tick Treatments
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {pet.name}'s treatment history
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push(`/flea-tick-treatments/add`)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Plus size={18} className="mr-2" />
                Add Treatment
              </Button>
              <button
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
                aria-label="Back"
              >
                <ArrowLeft size={24} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {sortedTreatments.length === 0 ? (
          <Card className="rounded-2xl border border-gray-200/80 dark:border-[#3a3b3c]/80 shadow-sm bg-white dark:bg-[#242526] p-12 text-center">
            <Bug size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No flea & tick treatments yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start tracking {pet.name}'s flea and tick prevention
            </p>
            <Button
              onClick={() => router.push(`/flea-tick-treatments/add`)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Plus size={18} className="mr-2" />
              Add First Treatment
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedTreatments.map((treatment, index) => {
              const status = getTreatmentStatus(treatment.nextDue);

              return (
                <Card
                  key={index}
                  className="rounded-2xl border border-gray-200/80 dark:border-[#3a3b3c]/80 shadow-sm bg-white dark:bg-[#242526] hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {treatment.treatment}
                          </h3>
                          {status && (
                            <Badge className={`${status.color} border-0`}>
                              {status.label}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 font-medium">Date Started:</span>
                              <p className="text-gray-900 dark:text-white mt-1">{formatDate(treatment.date)}</p>
                            </div>
                            
                            {treatment.dosage && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Dosage:</span>
                                <p className="text-gray-900 dark:text-white mt-1">{treatment.dosage}</p>
                              </div>
                            )}
                            
                            {treatment.prescribingVet && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Prescribing Vet:</span>
                                <p className="text-gray-900 dark:text-white mt-1">{treatment.prescribingVet}</p>
                              </div>
                            )}
                            
                            {treatment.nextDue && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Next Due:</span>
                                <p className="text-gray-900 dark:text-white mt-1">
                                  {formatDate(treatment.nextDue)}
                                  {status && <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">({status.days} days)</span>}
                                </p>
                              </div>
                            )}
                          </div>

                          {treatment.notes && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-[#18191a] rounded-lg border border-gray-200 dark:border-[#3a3b3c]">
                              <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Notes:</span>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{treatment.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/flea-tick-treatments/edit/${petId}/${index}`)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTreatment(index)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
