"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pet } from "@/models/Pet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Weight, Palette, Stethoscope } from "lucide-react";

interface PetCardProps {
  // dateAdded from Mongo will often be a string after JSON serialize
  pet: Pet & { dateAdded?: string | Date; photoUrl?: string };
}

export function PetCard({ pet }: PetCardProps) {
  const router = useRouter();

  // Prefer photos[0]; fall back to legacy photoUrl if present
  const primaryPhoto =
    (Array.isArray((pet as any).photos) && (pet as any).photos[0]) ||
    (pet as any).photoUrl ||
    "";

  const getSpeciesEmoji = (species: string) => {
    switch (species?.toLowerCase?.()) {
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
      default:
        return "🐾";
    }
  };

  const getAgeString = (age: number) => {
    if (age === 1) return "1 year old";
    if (age < 1) return `${Math.round(age * 12)} months old`;
    return `${age} years old`;
  };

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      {/* Media header */}
      <div className="relative aspect-[16/9] w-full">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto}
            alt={pet.name}
            fill
            className="object-cover"
            // if using your own API/file URLs, skip Next optimization unless you configured next.config.js
            unoptimized
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="text-5xl">{getSpeciesEmoji(pet.species)}</div>
          </div>
        )}
        {/* small badge over media */}
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-xs ring-1 ring-slate-200">
          {pet.breed ? `${pet.breed} ${pet.species}` : pet.species}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">
              {pet.name}
            </CardTitle>
            <p className="text-sm text-gray-600">{getAgeString(pet.age)}</p>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            {pet.species}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
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
              {(pet as any).dateAdded && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Added: {formatDate((pet as any).dateAdded)}</span>
                </div>
              )}
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
              <div>Treatments: {pet.medicalHistory?.treatments?.length || 0}</div>
              <div>
                Medications: {pet.medicalHistory?.medications?.length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Vaccinations */}
        {pet.medicalHistory?.vaccinations?.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">
              Recent Vaccinations
            </h4>
            <div className="space-y-1">
              {pet.medicalHistory.vaccinations.slice(-2).map((vaccination, i) => (
                <div
                  key={i}
                  className="text-sm bg-green-50 p-2 rounded border border-green-200"
                >
                  <span className="font-medium">{vaccination.vaccine}</span>
                  <span className="text-gray-600 ml-2">
                    ({formatDate(vaccination.date as any)})
                  </span>
                  {vaccination.nextDue && (
                    <span className="text-orange-600 ml-2">
                      Next due: {formatDate(vaccination.nextDue as any)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Medications */}
        {pet.medicalHistory?.medications &&
          pet.medicalHistory.medications.some(
            (m) => !m.endDate || new Date(m.endDate as any) > new Date()
          ) && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Current Medications
              </h4>
              <div className="space-y-1">
                {pet.medicalHistory.medications
                  .filter((m) => !m.endDate || new Date(m.endDate as any) > new Date())
                  .slice(0, 2)
                  .map((medication, i) => (
                    <div
                      key={i}
                      className="text-sm bg-blue-50 p-2 rounded border border-blue-200"
                    >
                      <span className="font-medium">{medication.medication}</span>
                      <span className="text-gray-600 ml-2">
                        ({medication.dosage})
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* Notes */}
        {pet.notes && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border line-clamp-3">
              {pet.notes}
            </p>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex gap-2 bg-white/90 backdrop-blur-sm p-3 rounded-lg border shadow-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/pets/edit/${(pet as any)._id}`)}
              className="flex-1"
            >
              Edit Pet
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Add Record
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              View History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
