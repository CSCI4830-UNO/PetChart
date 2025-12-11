"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddPetCard() {
    const router = useRouter();

    const handleAddPet = () => {
        router.push("/pets/add");
    };

    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-dashed border-2 border-gray-300 dark:border-[#3a3b3c] hover:border-purple-400 dark:hover:border-purple-600">
            <CardHeader className="text-center py-8" onClick={handleAddPet}>
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                        <Plus size={32} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-700 dark:text-gray-200">
                            Add New Pet
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Start tracking a new pet's health
                        </p>
                    </div>
                    <Button onClick={handleAddPet} className="mt-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600">
                        Add Pet
                    </Button>
                </div>
            </CardHeader>
        </Card>
    );
}