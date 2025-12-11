"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pet } from "@/models/Pet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Weight, Palette, Stethoscope, Bug } from "lucide-react";

interface PetCardProps {
  pet: Pet & { dateAdded?: string | Date; photoUrl?: string };
}

export function PetCard({ pet }: PetCardProps) {
  const router = useRouter();

  // Prefer photos[0]; fall back to legacy photoUrl if present
  const primaryPhoto =
    (Array.isArray((pet as any).photos) && (pet as any).photos[0]) ||
    (pet as any).photoUrl ||
    "";

  const fleaTickTreatments = pet.medicalHistory?.fleaTickTreatments || [];
  const nextFleaTickDue =
    fleaTickTreatments
      .map((t) => (t.nextDue ? new Date(t.nextDue as any) : null))
      .filter(Boolean)
      .sort((a, b) => (a as Date).getTime() - (b as Date).getTime())[0] || undefined;
  const lastFleaTick = fleaTickTreatments[fleaTickTreatments.length - 1];

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
            unoptimized
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#242526] dark:to-[#2a2b2c]">
            <div className="text-5xl">{getSpeciesEmoji(pet.species)}</div>
          </div>
        )}
        {/* small badge over media */}
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-white/90 dark:bg-[#242526]/90 px-2 py-0.5 text-xs ring-1 ring-slate-200 dark:ring-[#3a3b3c] text-gray-900 dark:text-gray-200">
          {pet.breed ? `${pet.breed} ${pet.species}` : pet.species}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {pet.name}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">{getAgeString(pet.age)}</p>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
          >
            {pet.species}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Heart size={16} className="text-red-500" />
              Basic Information
            </h4>
            <div className="space-y-1 text-sm text-gray-900 dark:text-gray-300">
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
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Stethoscope size={16} className="text-green-500" />
              Medical Summary
            </h4>
            <div className="space-y-1 text-sm text-gray-900 dark:text-gray-300">
              <div>Vaccinations: {pet.medicalHistory?.vaccinations?.length || 0}</div>
              <div>Treatments: {pet.medicalHistory?.treatments?.length || 0}</div>
              <div>Medications: {pet.medicalHistory?.medications?.length || 0}</div>
              <div>Flea & Tick: {fleaTickTreatments.length}</div>
            </div>
          </div>
        </div>

        {/* Flea & Tick summary */}
        {fleaTickTreatments.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Bug size={16} className="text-amber-600" />
              Flea & Tick
            </h4>
            <div className="space-y-1 text-sm">
              {lastFleaTick && (
                <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded border border-amber-200 dark:border-amber-800">
                  <span className="font-medium text-gray-900 dark:text-gray-200">Last: {lastFleaTick.treatment}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">{formatDate(lastFleaTick.date as any)}</span>
                </div>
              )}
              {nextFleaTickDue && (
                <div className="text-amber-700 dark:text-amber-400">Next due: {formatDate(nextFleaTickDue)}</div>
              )}
            </div>
          </div>
        )}

        {/* Recent Vaccinations */}
        {pet.medicalHistory?.vaccinations?.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Recent Vaccinations
            </h4>
            <div className="space-y-1">
              {pet.medicalHistory.vaccinations.slice(-2).map((vaccination, i) => (
                <div
                  key={i}
                  className="text-sm bg-green-50 dark:bg-green-900/30 p-2 rounded border border-green-200 dark:border-green-800"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-200">{vaccination.vaccine}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    ({formatDate(vaccination.date as any)})
                  </span>
                  {vaccination.nextDue && (
                    <span className="text-orange-600 dark:text-orange-400 ml-2">
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
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Current Medications
              </h4>
              <div className="space-y-1">
                {pet.medicalHistory.medications
                  .filter((m) => !m.endDate || new Date(m.endDate as any) > new Date())
                  .slice(0, 2)
                  .map((medication, i) => (
                    <div
                      key={i}
                      className="text-sm bg-blue-50 dark:bg-blue-900/30 p-2 rounded border border-blue-200 dark:border-blue-800"
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-200">{medication.medication}</span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
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
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#242526] p-3 rounded border dark:border-[#3a3b3c] line-clamp-3">
              {pet.notes}
            </p>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/95 dark:bg-[#242526]/95 backdrop-blur-sm p-3 rounded-lg border dark:border-[#3a3b3c] shadow-md">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/pets/edit/${(pet as any)._id}`)}
              className="w-full justify-center"
            >
              Edit Pet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/medications/${(pet as any)._id}`)}
              className="w-full justify-center"
            >
              View Meds
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/vaccines/${(pet as any)._id}`)}
              className="w-full justify-center"
            >
              View Vaccines
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/flea-tick-treatments/${(pet as any)._id}`)}
              className="w-full justify-center"
            >
              Flea & Tick
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
