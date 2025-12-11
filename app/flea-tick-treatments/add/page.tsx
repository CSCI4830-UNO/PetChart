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
import { Bug, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed?: string;
}

export default function AddFleaTickTreatment() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    petId: "",
    treatment: "",
    date: "",
    nextDue: "",
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
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, petId: data[0]._id }));
          }
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
      if (!formData.petId || !formData.treatment || !formData.date) {
        toast.error('Please fill required fields');
        return;
      }

      const res = await fetch(`/api/pets/${formData.petId}/flea-tick-treatments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatment: formData.treatment,
          date: formData.date,
          nextDue: formData.nextDue || undefined,
          notes: formData.notes || undefined
        })
      });

      if (res.ok) {
        toast.success('Flea & tick treatment added');
        router.push(`/flea-tick-treatments/${formData.petId}`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add treatment');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to add treatment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#18191a] text-gray-900 dark:text-white">
      <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-[#3a3b3c]/70 bg-white/80 dark:bg-[#242526]/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#242526]/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between py-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Add Flea & Tick Treatment</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Record a treatment for a pet</p>
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
              <h2 className="text-3xl font-semibold tracking-tight dark:text-white">Track Flea & Tick Treatments</h2>
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
                  <Label htmlFor="pet">Select Pet *</Label>
                  <Select value={formData.petId} onValueChange={(v) => handleInputChange('petId', v)}>
                    <SelectTrigger className="rounded-xl border-gray-200 dark:border-[#3a3b3c] dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] dark:bg-[#18191a] h-12 text-gray-900 dark:text-white dark:text-white">
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
                  <Label htmlFor="treatment">Treatment Name *</Label>
                  <Input
                    id="treatment"
                    value={formData.treatment}
                    onChange={(e) => handleInputChange('treatment', e.target.value)}
                    required
                    placeholder="e.g., Frontline Plus, NexGard"
                    className="rounded-xl border-gray-200 dark:border-[#3a3b3c] dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] dark:bg-[#18191a] text-gray-900 dark:text-white dark:text-white placeholder:text-gray-400"
                  />
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
                      className="rounded-xl border-gray-200 dark:border-[#3a3b3c] dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] dark:bg-[#18191a] text-gray-900 dark:text-white dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nextDue">Next Due Date (optional)</Label>
                    <Input
                      id="nextDue"
                      type="date"
                      value={formData.nextDue}
                      onChange={(e) => handleInputChange('nextDue', e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-[#3a3b3c] dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] dark:bg-[#18191a] text-gray-900 dark:text-white dark:text-white"
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
                    className="rounded-xl border-gray-200 dark:border-[#3a3b3c] dark:border-[#3a3b3c] bg-white dark:bg-[#18191a] dark:bg-[#18191a] text-gray-900 dark:text-white dark:text-white placeholder:text-gray-400 min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="rounded-full px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Adding...' : 'Add Treatment'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}



