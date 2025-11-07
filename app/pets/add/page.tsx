"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, PawPrint, Upload, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function AddPet() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        species: "",
        breed: "",
        age: "",
        weight: "",
        color: "",
        microchipId: "",
        birthday: "",
        notes: ""
    });

    // Redirect if not authenticated
    if (status === "unauthenticated") {
        router.push("/");
        return null;
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateAgeFromBirthday = (birthday: string) => {
        if (!birthday) return 0;
        const birthDate = new Date(birthday);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - birthDate.getTime());
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        return Math.round(diffYears * 10) / 10; // Round to 1 decimal place
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.name || !formData.species) {
                toast.error("Please fill in all required fields (Name and Species)");
                return;
            }

            // Calculate age from birthday if provided, otherwise use entered age
            let ageToSubmit = formData.age ? parseFloat(formData.age) : 0;
            if (formData.birthday) {
                ageToSubmit = calculateAgeFromBirthday(formData.birthday);
            }

            const petData = {
                name: formData.name,
                species: formData.species,
                breed: formData.breed || undefined,
                age: ageToSubmit,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                color: formData.color || undefined,
                microchipId: formData.microchipId || undefined,
                birthday: formData.birthday || undefined,
                notes: formData.notes || undefined
            };

            const response = await fetch("/api/pets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(petData),
            });

            if (response.ok) {
                const newPet = await response.json();
                toast.success(`${newPet.name} has been added successfully!`);
                router.push("/");
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to add pet");
            }
        } catch (error) {
            console.error("Error adding pet:", error);
            toast.error("Failed to add pet");
        } finally {
            setLoading(false);
        }
    };

    const getSpeciesEmoji = (species: string) => {
        switch (species.toLowerCase()) {
            case 'dog': return '🐕';
            case 'cat': return '🐱';
            case 'bird': return '🐦';
            case 'rabbit': return '🐰';
            case 'fish': return '🐠';
            case 'hamster': return '🐹';
            case 'guinea pig': return '🐹';
            case 'reptile': return '🦎';
            case 'horse': return '🐴';
            default: return '🐾';
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="mr-4"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                <PawPrint size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Add New Pet</h1>
                                <p className="text-sm text-gray-600">Add a new member to your pet family</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Basic Information */}
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PawPrint size={20} className="text-purple-600" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Pet Name *</Label>
                                            <Input
                                                type="text"
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
                                                <SelectContent>
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
                                                type="text"
                                                id="breed"
                                                value={formData.breed}
                                                onChange={(e) => handleInputChange("breed", e.target.value)}
                                                placeholder="e.g., Golden Retriever, Siamese, Parakeet"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="color">Color/Markings</Label>
                                            <Input
                                                type="text"
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
                                        <Calendar size={20} className="text-blue-600" />
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
                                                max={new Date().toISOString().split('T')[0]}
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
                                                type="text"
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

                        {/* Right Column - Additional Info & Preview */}
                        <div className="space-y-6">
                            {/* Notes */}
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

                                        {/* Photo Upload Placeholder */}
                                        <div>
                                            <Label>Pet Photo (Coming Soon)</Label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                                                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500">Photo upload feature coming soon!</p>
                                            </div>
                                        </div>
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
                                        {formData.name && (
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">
                                                    {getSpeciesEmoji(formData.species)}
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
                                                {formData.breed && formData.species && (
                                                    <p className="text-gray-600">{formData.breed} {formData.species}</p>
                                                )}
                                            </div>
                                        )}

                                        {(formData.age || formData.birthday) && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Age</h4>
                                                <p className="text-gray-600">
                                                    {formData.birthday 
                                                        ? `${calculateAgeFromBirthday(formData.birthday)} years old`
                                                        : formData.age ? `${formData.age} years old` : ""
                                                    }
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
                                                <p className="text-gray-600 font-mono text-sm">{formData.microchipId}</p>
                                            </div>
                                        )}

                                        {!formData.name && !formData.species && (
                                            <div className="text-center py-8 text-gray-400">
                                                <PawPrint size={48} className="mx-auto mb-4" />
                                                <p>Fill in the form to see pet preview</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.name || !formData.species}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {loading ? "Adding Pet..." : "Add Pet"}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}