"use client";

import { SignInBtn } from "@/components/signInBtn";
import { PetCard } from "@/components/PetCard";
import { AddPetCard } from "@/components/AddPetCard";
import { Heart, PawPrint } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Sample pet data for demonstration
const samplePets = [
  {
    _id: "1",
    name: "Bella",
    species: "Dog",
    breed: "Golden Retriever",
    age: 3,
    weight: 65,
    color: "Golden",
    microchipId: "123456789",
    dateAdded: new Date("2024-01-15"),
    owner: "user@example.com",
    medicalHistory: {
      vaccinations: [
        {
          vaccine: "Rabies",
          date: new Date("2024-03-10"),
          nextDue: new Date("2025-03-10")
        },
        {
          vaccine: "DHPP",
          date: new Date("2024-03-10"),
          nextDue: new Date("2025-03-10")
        }
      ],
      treatments: [
        {
          treatment: "Dental Cleaning",
          date: new Date("2024-02-20"),
          notes: "Routine cleaning, no issues found"
        }
      ],
      medications: [
        {
          medication: "Heartguard Plus",
          dosage: "68mg monthly",
          startDate: new Date("2024-01-01"),
          endDate: undefined,
          notes: "Heartworm prevention"
        }
      ]
    },
    notes: "Very friendly and energetic. Loves playing fetch and swimming."
  },
  {
    _id: "2",
    name: "Whiskers",
    species: "Cat",
    breed: "Siamese",
    age: 5,
    weight: 12,
    color: "Cream and Brown",
    dateAdded: new Date("2023-08-22"),
    owner: "user@example.com",
    medicalHistory: {
      vaccinations: [
        {
          vaccine: "FVRCP",
          date: new Date("2024-01-15"),
          nextDue: new Date("2025-01-15")
        }
      ],
      treatments: [],
      medications: []
    },
    notes: "Indoor cat, very calm and loves to nap in sunny spots."
  },
  {
    _id: "3",
    name: "Charlie",
    species: "Bird",
    breed: "Parakeet",
    age: 2,
    color: "Blue and White",
    dateAdded: new Date("2024-06-10"),
    owner: "user@example.com",
    medicalHistory: {
      vaccinations: [],
      treatments: [
        {
          treatment: "Wing trimming",
          date: new Date("2024-09-15"),
          notes: "Routine wing trim for safety"
        }
      ],
      medications: []
    },
    notes: "Very talkative and loves to mimic sounds. Enjoys flying around the living room."
  }
];

export default function Home() {
  // Get client-side session info
  const { data: session, status } = useSession();
  const router = useRouter();

  // For now, we'll use sample data. In a real app, you'd fetch pets based on the user's session
  const pets = samplePets;

  const handleAddPet = () => {
    console.log("Add new pet functionality to be implemented");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <PawPrint size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">PetChart</h1>
                <p className="text-sm text-gray-600">Your pet's health companion</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {session?.user && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Welcome back,</p>
                  <p className="font-medium text-gray-900">{session.user.name}</p>
                </div>
              )}
              <SignInBtn />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session?.user ? (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <Heart size={28} className="text-red-500" />
                Your Pet Family
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Keep track of your pets' health, vaccinations, treatments, and more all in one place. 
                Click on any pet card to view detailed information and medical history.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{pets.length}</div>
                <div className="text-gray-600">Total Pets</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {pets.reduce((sum, pet) => sum + (pet.medicalHistory?.vaccinations?.length || 0), 0)}
                </div>
                <div className="text-gray-600">Vaccinations</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {pets.filter(pet => 
                    pet.medicalHistory?.medications?.some(med => 
                      !med.endDate || new Date(med.endDate) > new Date()
                    )
                  ).length}
                </div>
                <div className="text-gray-600">Active Medications</div>
              </div>
            </div>

            {/* Pet Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <PetCard key={pet._id} pet={pet as any} />
              ))}
              <AddPetCard onAddPet={handleAddPet} />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => router.push("/appointments/schedule")}
                  className="p-4 text-center bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="text-2xl mb-2">�</div>
                  <div className="text-sm font-medium text-blue-900">Schedule Appointment</div>
                </button>
                <button 
                  onClick={() => router.push("/appointments")}
                  className="p-4 text-center bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="text-2xl mb-2">🏥</div>
                  <div className="text-sm font-medium text-green-900">View Appointments</div>
                </button>
                <button className="p-4 text-center bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="text-2xl mb-2">💊</div>
                  <div className="text-sm font-medium text-purple-900">Add Medication</div>
                </button>
                <button className="p-4 text-center bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium text-orange-900">View Reports</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Sign In Prompt */
          <div className="text-center py-16 space-y-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <PawPrint size={48} className="text-blue-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Welcome to PetChart</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your comprehensive pet health tracking solution. Keep detailed records of vaccinations, 
                treatments, medications, and more for all your beloved pets.
              </p>
            </div>
            <div className="space-y-4">
              <SignInBtn />
              <p className="text-sm text-gray-500">
                Sign in to start tracking your pets' health and medical history
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
