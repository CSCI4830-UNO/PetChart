"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface AddPetCardProps {
    onAddPet: () => void;
}

export function AddPetCard({ onAddPet }: AddPetCardProps) {
    return (
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-dashed border-2 border-gray-300 hover:border-blue-400">
            <CardHeader className="text-center py-8">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <Plus size={32} className="text-blue-600" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-700">
                            Add New Pet
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                            Start tracking a new pet's health
                        </p>
                    </div>
                    <Button onClick={onAddPet} className="mt-2">
                        Add Pet
                    </Button>
                </div>
            </CardHeader>
        </Card>
    );
}