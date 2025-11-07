"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pet } from "@/models/Pet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Heart, Calendar, Weight, Palette, Stethoscope } from "lucide-react";

interface PetCardProps {
    pet: Pet;
}

export function PetCard({ pet }: PetCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();

    const getSpeciesEmoji = (species: string) => {
        switch (species.toLowerCase()) {
            case 'dog': return '🐕';
            case 'cat': return '🐱';
            case 'bird': return '🐦';
            case 'rabbit': return '🐰';
            case 'fish': return '🐠';
            case 'hamster': return '🐹';
            default: return '🐾';
        }
    };

    const getAgeString = (age: number) => {
        if (age === 1) return '1 year old';
        if (age < 1) return `${Math.round(age * 12)} months old`;
        return `${age} years old`;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
            <CardHeader 
                onClick={() => setIsExpanded(!isExpanded)}
                className="pb-3"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">
                            {getSpeciesEmoji(pet.species)}
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-800">
                                {pet.name}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                                {pet.breed ? `${pet.breed} ${pet.species}` : pet.species} • {getAgeString(pet.age)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {pet.species}
                        </Badge>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="pt-0 space-y-4 animate-in slide-in-from-top-5 duration-300">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                <Heart size={16} className="text-red-500" />
                                Basic Information
                            </h4>
                            <div className="space-y-1 text-sm">
                                {pet.weight && (
                                    <div className="flex items-center gap-2">
                                        <Weight size={14} />
                                        <span>Weight: {pet.weight} lbs</span>
                                    </div>
                                )}
                                {pet.color && (
                                    <div className="flex items-center gap-2">
                                        <Palette size={14} />
                                        <span>Color: {pet.color}</span>
                                    </div>
                                )}
                                {pet.microchipId && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        <span>Microchip: {pet.microchipId}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>Added: {formatDate(pet.dateAdded)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Medical History Summary */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                <Stethoscope size={16} className="text-green-500" />
                                Medical Summary
                            </h4>
                            <div className="space-y-1 text-sm">
                                <div>
                                    Vaccinations: {pet.medicalHistory?.vaccinations?.length || 0}
                                </div>
                                <div>
                                    Treatments: {pet.medicalHistory?.treatments?.length || 0}
                                </div>
                                <div>
                                    Medications: {pet.medicalHistory?.medications?.length || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Vaccinations */}
                    {pet.medicalHistory?.vaccinations && pet.medicalHistory.vaccinations.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Recent Vaccinations</h4>
                            <div className="space-y-1">
                                {pet.medicalHistory.vaccinations.slice(-3).map((vaccination, index) => (
                                    <div key={index} className="text-sm bg-green-50 p-2 rounded border border-green-200">
                                        <span className="font-medium">{vaccination.vaccine}</span>
                                        <span className="text-gray-600 ml-2">({formatDate(vaccination.date)})</span>
                                        {vaccination.nextDue && (
                                            <span className="text-orange-600 ml-2">
                                                Next due: {formatDate(vaccination.nextDue)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Current Medications */}
                    {pet.medicalHistory?.medications && 
                     pet.medicalHistory.medications.filter(med => !med.endDate || new Date(med.endDate) > new Date()).length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Current Medications</h4>
                            <div className="space-y-1">
                                {pet.medicalHistory.medications
                                    .filter(med => !med.endDate || new Date(med.endDate) > new Date())
                                    .map((medication, index) => (
                                    <div key={index} className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                                        <span className="font-medium">{medication.medication}</span>
                                        <span className="text-gray-600 ml-2">({medication.dosage})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {pet.notes && (
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                                {pet.notes}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/pets/edit/${pet._id}`)}
                        >
                            Edit Pet
                        </Button>
                        <Button variant="outline" size="sm">
                            Add Record
                        </Button>
                        <Button variant="outline" size="sm">
                            View Full History
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}