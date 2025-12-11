"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Pill, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Defines the Medication type
interface Pet {
  _id: string;
  name: string;
  species: string;
  breed?: string;
}
// Main component for adding medication
export default function AddMedication() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    petId: "",
    medication: "",
    dosage: "",
    startDate: "",
    endDate: "",
    notes: ""
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPets = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch('/api/pets');
        if (res.ok) {
          const data = await res.json();
          setPets(data);
        } else {
          toast.error('Failed to load pets');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load pets');
      }
    };

    fetchPets();
  }, [session]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.petId || !formData.medication || !formData.dosage || !formData.startDate) {
        toast.error('Please fill required fields');
        return;
      }

      // API call to add medication
      const res = await fetch(`/api/pets/${formData.petId}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medication: formData.medication,
          dosage: formData.dosage,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          notes: formData.notes || undefined
        })
      });

      if (res.ok) {
        toast.success('Medication added');
        router.push(`/medications/${formData.petId}`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add medication');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to add medication');
    } finally {
      setLoading(false);
    }
  };
  
  // Displays the main component
  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#18191a] text-gray-900 dark:text-white">
      <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-[#3a3b3c]/70 bg-white/80 dark:bg-[#242526]/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#242526]/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between py-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Add Medication</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add a new medication for a pet</p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
              aria-label="Close"
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
              <h2 className="text-3xl font-semibold tracking-tight dark:text-white">Track Medications</h2>
            </div>
            <div className="rounded-full border border-gray-200 dark:border-[#3a3b3c] bg-white dark:bg-[#242526] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 shadow-sm">
              💊 Medication
            </div>
          </div>
            <div className="h-1 w-16 rounded-full bg-gray-900 dark:bg-white"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="rounded-2xl border border-gray-200 dark:border-[#3a3b3c]/80 shadow-sm bg-white dark:bg-[#242526]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                Medication Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pet">Select Pet *</Label>
                  <Select value={formData.petId} onValueChange={(v) => handleInputChange('petId', v)}>
                    <SelectTrigger className="rounded-xl border-gray-200 dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] h-12 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Choose a pet" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#18191a] dark:bg-[#18191a] shadow-lg border border-gray-200 dark:border-[#3a3b3c] dark:border-[#3a3b3c] rounded-xl">
                      {pets.map(p => (
                        <SelectItem key={p._id} value={p._id} className="cursor-pointer">{p.name} - {p.species}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="medication">Medication *</Label>
                  <Input
                    id="medication"
                    value={formData.medication}
                    onChange={(e) => handleInputChange('medication', e.target.value)}
                    required
                    placeholder="e.g., Amoxicillin"
                    className="rounded-xl border-gray-200 dark:border-[#3a3b3c] dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] dark:bg-[#18191a] text-gray-900 dark:text-white dark:text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => handleInputChange('dosage', e.target.value)}
                    required
                    placeholder="e.g., 5 mg once daily"
                    className="rounded-xl border-gray-200 dark:border-[#3a3b3c] dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] dark:bg-[#18191a] text-gray-900 dark:text-white dark:text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                      className="rounded-xl border-gray-200 dark:border-[#3a3b3c] dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] dark:bg-[#18191a] text-gray-900 dark:text-white dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date (optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-[#3a3b3c] dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] dark:bg-[#18191a] text-gray-900 dark:text-white dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    placeholder="Any additional information..."
                    className="rounded-xl border-gray-200 dark:border-[#3a3b3c] dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] dark:bg-[#18191a] text-gray-900 dark:text-white dark:text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="rounded-full border-gray-200 dark:border-[#3a3b3c] dark:border-[#3a3b3c] text-gray-800 hover:bg-gray-100 dark:bg-[#3a3b3c] dark:bg-[#3a3b3c]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-full bg-gray-900 px-6 text-white hover:bg-black"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Medication'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}



