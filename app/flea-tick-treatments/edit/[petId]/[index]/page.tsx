"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: string;
  color?: string;
  microchipId?: string;
  notes?: string;
  medicalHistory: {
    fleaTickTreatments: any[];
    vaccinations?: any[];
    medications?: any[];
  };
}

export default function EditFleaTickTreatment() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  const index = parseInt(params.index as string);

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    treatment: "",
    dosage: "",
    date: "",
    nextDue: "",
    prescribingVet: "",
    notes: ""
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPet = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch(`/api/pets/${petId}`);
        if (res.ok) {
          const data = await res.json();
          setPet(data);
          
          const treatment = data.medicalHistory?.fleaTickTreatments?.[index];
          if (treatment) {
            setFormData({
              treatment: treatment.treatment || "",
              dosage: treatment.dosage || "",
              date: treatment.date ? new Date(treatment.date).toISOString().split('T')[0] : "",
              nextDue: treatment.nextDue ? new Date(treatment.nextDue).toISOString().split('T')[0] : "",
              prescribingVet: treatment.prescribingVet || "",
              notes: treatment.notes || ""
            });
          } else {
            toast.error('Treatment not found');
            router.push(`/flea-tick-treatments/${petId}`);
          }
        } else {
          toast.error('Failed to load pet');
          router.push("/");
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load pet');
        router.push("/");
      }
    };

    fetchPet();
  }, [session, petId, index, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!pet || !formData.treatment || !formData.date) {
        toast.error('Please fill required fields');
        setLoading(false);
        return;
      }

      const updatedTreatments = [...pet.medicalHistory.fleaTickTreatments];
      updatedTreatments[index] = {
        treatment: formData.treatment,
        dosage: formData.dosage || undefined,
        date: formData.date,
        nextDue: formData.nextDue || undefined,
        prescribingVet: formData.prescribingVet || undefined,
        notes: formData.notes || undefined
      };

      const res = await fetch(`/api/pets/${petId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          weight: pet.weight,
          color: pet.color,
          microchipId: pet.microchipId,
          notes: pet.notes,
          medicalHistory: {
            ...pet.medicalHistory,
            fleaTickTreatments: updatedTreatments
          }
        })
      });

      if (res.ok) {
        toast.success('Treatment updated successfully');
        router.push(`/flea-tick-treatments/${petId}`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update treatment');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update treatment');
    } finally {
      setLoading(false);
    }
  };

  if (!pet) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#18191a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#18191a] text-gray-900 dark:text-white">
      <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-[#3a3b3c]/70 bg-white/80 dark:bg-[#242526]/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#242526]/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between py-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Edit Flea & Tick Treatment</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update treatment for {pet.name}</p>
            </div>
            <button
              onClick={() => router.push(`/flea-tick-treatments/${petId}`)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
              aria-label="Back"
            >
              <ArrowLeft size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Health</p>
              <h2 className="text-3xl font-semibold tracking-tight dark:text-white">Update Treatment Record</h2>
            </div>
            <div className="rounded-full border border-gray-200 dark:border-[#3a3b3c] bg-white dark:bg-[#242526] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 shadow-sm">
              🐛 Flea & Tick
            </div>
          </div>
          <div className="h-1 w-16 rounded-full bg-gray-900 dark:bg-white"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="rounded-2xl border border-gray-200 dark:border-[#3a3b3c]/80 shadow-sm bg-white dark:bg-[#242526]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                Treatment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="treatment">Treatment Name *</Label>
                  <Input
                    id="treatment"
                    value={formData.treatment}
                    onChange={(e) => handleInputChange('treatment', e.target.value)}
                    required
                    placeholder="e.g., Frontline Plus, NexGard"
                    className="rounded-xl border-gray-200 dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dosage">Dosage (optional)</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => handleInputChange('dosage', e.target.value)}
                      placeholder="e.g., 1 tablet, 0.5ml"
                      className="rounded-xl border-gray-200 dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prescribingVet">Prescribing Vet (optional)</Label>
                    <Input
                      id="prescribingVet"
                      value={formData.prescribingVet}
                      onChange={(e) => handleInputChange('prescribingVet', e.target.value)}
                      placeholder="e.g., Dr. Smith"
                      className="rounded-xl border-gray-200 dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Treatment Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                      className="rounded-xl border-gray-200 dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nextDue">Next Due Date (optional)</Label>
                    <Input
                      id="nextDue"
                      type="date"
                      value={formData.nextDue}
                      onChange={(e) => handleInputChange('nextDue', e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information..."
                    className="rounded-xl border-gray-200 dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] text-gray-900 dark:text-white placeholder:text-gray-400 min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/flea-tick-treatments/${petId}`)}
              className="rounded-full px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
