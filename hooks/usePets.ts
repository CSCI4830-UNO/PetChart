"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Pet {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    age: number;
    weight?: number;
    color?: string;
    microchipId?: string;
    dateAdded: Date;
    owner: string;
    medicalHistory: {
        vaccinations: Array<{
            vaccine: string;
            date: Date;
            nextDue?: Date;
        }>;
        treatments: Array<{
            treatment: string;
            date: Date;
            notes?: string;
        }>;
        medications: Array<{
            medication: string;
            dosage: string;
            startDate: Date;
            endDate?: Date;
            notes?: string;
        }>;
    };
    photos?: string[];
    notes?: string;
}

export function usePets() {
    const { data: session } = useSession();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPets = async () => {
            if (!session?.user?.email) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("/api/pets");
                if (response.ok) {
                    const data = await response.json();
                    setPets(data);
                } else {
                    setError("Failed to load pets");
                }
            } catch (err) {
                console.error("Error fetching pets:", err);
                setError("Failed to load pets");
            } finally {
                setLoading(false);
            }
        };

        fetchPets();
    }, [session]);

    const refreshPets = async () => {
        if (!session?.user?.email) return;

        try {
            const response = await fetch("/api/pets");
            if (response.ok) {
                const data = await response.json();
                setPets(data);
            }
        } catch (err) {
            console.error("Error refreshing pets:", err);
        }
    };

    return { pets, loading, error, refreshPets };
}