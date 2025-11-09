"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, PawPrint, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import UploadPhotoMongo from "@/components/uploadphotomongo";

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed?: string;
  age: number;
  weight?: number;
  color?: string;
  microchipId?: string;
  birthday?: string;
  notes?: string;
  photos?: string[]; // ⬅️ use array to match your model
}

export default function EditPet() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const petId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingPet, setLoadingPet] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    color: "",
    microchipId: "",
    birthday: "",
    notes: "",
    photos: [] as string[], // ⬅️ store photos here
  });
  const [isUploading, setIsUploading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  // Fetch pet data
  useEffect(() => {
    const fetchPet = async () => {
      if (!session?.user?.email || !petId) return;
      try {
        const response = await fetch(`/api/pets/${petId}`);
        if (response.ok) {
          const pet: Pet = await response.json();
          setFormData({
            name: pet.name,
            species: pet.species,
            breed: pet.breed || "",
            age: (pet.age as unknown as number)?.toString?.() ?? "",
            weight: pet.weight?.toString() || "",
            color: pet.color || "",
            microchipId: pet.microchipId || "",
            birthday: pet.birthday
              ? new Date(pet.birthday).toISOString().split("T")[0]
              : "",
            notes: pet.notes || "",
            photos: Array.isArray(pet.photos) ? pet.photos : [], // ⬅️ hydrate photos array
          });
        } else if (response.status === 404) {
          toast.error("Pet not found");
          router.push("/");
        } else {
          toast.error("Failed to load pet information");
        }
      } catch (e) {
        console.error("Error fetching pet:", e);
        toast.error("Failed to load pet information");
      } finally {
        setLoadingPet(false);
      }
    };
    fetchPet();
  }, [session, petId, router]);

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const calculateAgeFromBirthday = (birthday: string) => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const diffYears =
      Math.abs(Date.now() - birthDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25);
    return Math.round(diffYears * 10) / 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.name || !formData.species) {
        toast.error("Please fill in all required fields (Name and Species)");
        return;
      }

      let ageToSubmit = formData.age ? parseFloat(formData.age) : 0;
      if (formData.birthday)
        ageToSubmit = calculateAgeFromBirthday(formData.birthday);

      const petData: Partial<Pet> = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || undefined,
        age: ageToSubmit as unknown as number,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        color: formData.color || undefined,
        microchipId: formData.microchipId || undefined,
        birthday: formData.birthday || undefined,
        notes: formData.notes || undefined,
        photos: formData.photos, // ⬅️ send the array to the API
      };

      const res = await fetch(`/api/pets/${petId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(petData),
      });

      if (res.ok) {
        const updatedPet = await res.json();
        toast.success(`${updatedPet.name}'s information has been updated!`);
        router.push("/");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update pet");
      }
    } catch (e) {
      console.error("Error updating pet:", e);
      toast.error("Failed to update pet");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${formData.name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/pets/${petId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`${formData.name} has been deleted`);
        router.push("/");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete pet");
      }
    } catch (e) {
      console.error("Error deleting pet:", e);
      toast.error("Failed to delete pet");
    } finally {
      setDeleting(false);
    }
  };

  const getSpeciesEmoji = (species: string) => {
    switch (species.toLowerCase()) {
      case "dog":
        return "🐕";
      case "cat":
        return "🐱";
      case "bird":
        return "🐦";
      case "rabbit":
        return "🐰";
      case "fish":
        return "🐠";
      case "hamster":
        return "🐹";
      case "guinea pig":
        return "🐹";
      case "reptile":
        return "🦎";
      case "horse":
        return "🐴";
      default:
        return "🐾";
    }
  };

  if (status === "loading" || loadingPet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pet information...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const primaryPhoto = formData.photos[0]; // ⬅️ convenience variable

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4">
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <PawPrint size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Pet</h1>
                <p className="text-sm text-gray-600">
                  Update {formData.name}&apos;s information
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PawPrint size={20} className="text-blue-600" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Pet Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="e.g., Bella, Max, Whiskers"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="species">Species/Type *</Label>
                      <Select
                        value={formData.species}
                        onValueChange={(value) => handleInputChange("species", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose species" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Dog">🐕 Dog</SelectItem>
                          <SelectItem value="Cat">🐱 Cat</SelectItem>
                          <SelectItem value="Bird">🐦 Bird</SelectItem>
                          <SelectItem value="Rabbit">🐰 Rabbit</SelectItem>
                          <SelectItem value="Fish">🐠 Fish</SelectItem>
                          <SelectItem value="Hamster">🐹 Hamster</SelectItem>
                          <SelectItem value="Guinea Pig">🐹 Guinea Pig</SelectItem>
                          <SelectItem value="Reptile">🦎 Reptile</SelectItem>
                          <SelectItem value="Horse">🐴 Horse</SelectItem>
                          <SelectItem value="Other">🐾 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="breed">Breed</Label>
                      <Input
                        id="breed"
                        value={formData.breed}
                        onChange={(e) => handleInputChange("breed", e.target.value)}
                        placeholder="e.g., Golden Retriever, Siamese, Parakeet"
                      />
                    </div>

                    <div>
                      <Label htmlFor="color">Color/Markings</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => handleInputChange("color", e.target.value)}
                        placeholder="e.g., Golden, Black and White, Tabby"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Age & Physical Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={20} className="text-green-600" />
                    Age & Physical Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="birthday">Birthday (Optional)</Label>
                      <Input
                        type="date"
                        id="birthday"
                        value={formData.birthday}
                        onChange={(e) => handleInputChange("birthday", e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        If provided, age will be calculated automatically
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="age">Age (years)</Label>
                      <Input
                        type="number"
                        id="age"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        placeholder="e.g., 3.5"
                        step="0.1"
                        min="0"
                        max="50"
                        disabled={!!formData.birthday}
                      />
                      {formData.birthday && (
                        <p className="text-xs text-green-600 mt-1">
                          Calculated: {calculateAgeFromBirthday(formData.birthday)} years
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        type="number"
                        id="weight"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        placeholder="e.g., 65"
                        step="0.1"
                        min="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="microchip">Microchip ID</Label>
                      <Input
                        id="microchip"
                        value={formData.microchipId}
                        onChange={(e) => handleInputChange("microchipId", e.target.value)}
                        placeholder="e.g., 123456789012345"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Notes + Photo Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Any special information about your pet - personality, medical conditions, favorite activities, etc."
                        rows={5}
                      />
                    </div>

                    {/* Real photo uploader (primary = photos[0]) */}
                    <UploadPhotoMongo
                      value={primaryPhoto}
                      onChange={(url) =>
                        setFormData((p) => ({
                          ...p,
                          photos: url ? [url] : [],
                        }))
                      }
                      onUploading={(b) => setIsUploading(b)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Pet Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Show uploaded image if present */}
                    {primaryPhoto && (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg ring-1 ring-gray-200">
                        <Image
                          src={primaryPhoto}
                          alt={formData.name || "Pet photo"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}

                    {formData.name && (
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {getSpeciesEmoji(formData.species)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {formData.name}
                        </h3>
                        {formData.breed && formData.species && (
                          <p className="text-gray-600">
                            {formData.breed} {formData.species}
                          </p>
                        )}
                      </div>
                    )}

                    {(formData.age || formData.birthday) && (
                      <div>
                        <h4 className="font-medium text-gray-900">Age</h4>
                        <p className="text-gray-600">
                          {formData.birthday
                            ? `${calculateAgeFromBirthday(formData.birthday)} years old`
                            : formData.age
                            ? `${formData.age} years old`
                            : ""}
                        </p>
                      </div>
                    )}

                    {formData.weight && (
                      <div>
                        <h4 className="font-medium text-gray-900">Weight</h4>
                        <p className="text-gray-600">{formData.weight} lbs</p>
                      </div>
                    )}

                    {formData.color && (
                      <div>
                        <h4 className="font-medium text-gray-900">Color</h4>
                        <p className="text-gray-600">{formData.color}</p>
                      </div>
                    )}

                    {formData.microchipId && (
                      <div>
                        <h4 className="font-medium text-gray-900">Microchip</h4>
                        <p className="text-gray-600 font-mono text-sm">
                          {formData.microchipId}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Delete Pet
                </>
              )}
            </Button>

            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || isUploading || !formData.name || !formData.species}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Updating..." : isUploading ? "Uploading…" : "Update Pet"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
