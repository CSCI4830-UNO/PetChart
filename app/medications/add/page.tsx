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

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed?: string;
}

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
        router.push('/');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Pill size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add Medication</h1>
                <p className="text-sm text-gray-600">Add a new medication for a pet</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medication Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pet">Select Pet *</Label>
                  <Select value={formData.petId} onValueChange={(v) => handleInputChange('petId', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a pet" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {pets.map(p => (
                        <SelectItem key={p._id} value={p._id}>{p.name} - {p.species}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="medication">Medication *</Label>
                  <Input id="medication" value={formData.medication} onChange={(e) => handleInputChange('medication', e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input id="dosage" value={formData.dosage} onChange={(e) => handleInputChange('dosage', e.target.value)} required placeholder="e.g., 5 mg once daily" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => handleInputChange('startDate', e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date (optional)</Label>
                    <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => handleInputChange('endDate', e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} rows={3} />
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={loading}>{loading ? 'Adding...' : 'Add Medication'}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
