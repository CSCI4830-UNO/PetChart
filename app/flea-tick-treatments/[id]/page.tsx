"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bug, Calendar, Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface FleaTreatment {
  treatment: string;
  date: string;
  nextDue?: string;
  notes?: string;
  _id?: string;
}

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed?: string;
  medicalHistory: {
    fleaTickTreatments: FleaTreatment[];
  };
}

export default function FleaTickTreatmentHistory() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const petId = params.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

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

  useEffect(() => {
    if (session?.user?.email && petId) {
      fetchPet();
    }
  }, [session, petId]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysUntilDue = (nextDue: string) => {
    const dueDate = new Date(nextDue);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTreatmentStatus = (nextDue?: string) => {
    if (!nextDue) return null;

    const daysUntil = getDaysUntilDue(nextDue);

    if (daysUntil < 0) {
      return { label: "Overdue", color: "bg-red-100 text-red-800", days: Math.abs(daysUntil) };
    } else if (daysUntil <= 7) {
      return { label: "Due Soon", color: "bg-orange-100 text-orange-800", days: daysUntil };
    } else if (daysUntil <= 30) {
      return { label: "Upcoming", color: "bg-blue-100 text-blue-800", days: daysUntil };
    }

    return { label: "Scheduled", color: "bg-gray-100 text-gray-800", days: daysUntil };
  };

  if (loading || !pet) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const treatments = pet.medicalHistory?.fleaTickTreatments || [];
  const sortedTreatments = [...treatments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                aria-label="Back"
              >
                <ArrowLeft size={24} strokeWidth={1.5} />
              </button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                  Flea & Tick Treatments
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {pet.name}'s treatment history
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push(`/flea-tick-treatments/add`)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Plus size={18} className="mr-2" />
              Add Treatment
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {sortedTreatments.length === 0 ? (
          <Card className="rounded-2xl border border-gray-200/80 shadow-sm bg-white p-12 text-center">
            <Bug size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No flea & tick treatments yet
            </h3>
            <p className="text-gray-600 mb-6">
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
                  className="rounded-2xl border border-gray-200/80 shadow-sm bg-white hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {treatment.treatment}
                          </h3>
                          {status && (
                            <Badge className={`${status.color} border-0`}>
                              {status.label}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Applied: {formatDate(treatment.date)}</span>
                          </div>

                          {treatment.nextDue && (
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>
                                Next due: {formatDate(treatment.nextDue)}
                                {status && ` (${status.days} days)`}
                              </span>
                            </div>
                          )}

                          {treatment.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{treatment.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTreatment(index)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
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
