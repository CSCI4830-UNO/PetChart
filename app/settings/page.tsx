"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface NotificationPreferences {
    appointmentReminders: boolean;
    vaccinationReminders: boolean;
    fleaTickReminders: boolean;
}

export default function Settings() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        appointmentReminders: true,
        vaccinationReminders: true,
        fleaTickReminders: true,
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    // Fetch user preferences
    useEffect(() => {
        const fetchPreferences = async () => {
            if (!session?.user?.email) return;

            try {
                const response = await fetch("/api/users/preferences");
                if (response.ok) {
                    const data = await response.json();
                    setPreferences(data.notificationPreferences || preferences);
                } else {
                    // Use defaults if not found
                    setFetching(false);
                }
            } catch (error) {
                console.error("Error fetching preferences:", error);
            } finally {
                setFetching(false);
            }
        };

        if (session) {
            fetchPreferences();
        }
    }, [session]);

    const handleToggle = (key: keyof NotificationPreferences) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setLoading(true);

        try {
            const response = await fetch("/api/users/preferences", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    notificationPreferences: preferences
                }),
            });

            if (response.ok) {
                toast.success("Preferences saved successfully!");
            } else {
                toast.error("Failed to save preferences");
            }
        } catch (error) {
            console.error("Error saving preferences:", error);
            toast.error("Failed to save preferences");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || fetching) {
        return (
            <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7]">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900">Settings</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage your preferences</p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                            aria-label="Close"
                        >
                            <ArrowLeft size={24} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
                <div className="space-y-8">
                    {/* Notification Preferences */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Notifications</h2>
                        
                        <div className="space-y-4">
                            {/* Flea & Tick Reminders */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Flea & Tick Treatment Reminders</h3>
                                    <p className="text-sm text-gray-600 mt-1">Get email notifications for flea & tick treatments due soon</p>
                                </div>
                                <button
                                    onClick={() => handleToggle("fleaTickReminders")}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                        preferences.fleaTickReminders
                                            ? "bg-blue-600"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                            preferences.fleaTickReminders
                                                ? "translate-x-7"
                                                : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Appointment Reminders */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Appointment Reminders</h3>
                                    <p className="text-sm text-gray-600 mt-1">Get email notifications for upcoming appointments</p>
                                </div>
                                <button
                                    onClick={() => handleToggle("appointmentReminders")}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                        preferences.appointmentReminders
                                            ? "bg-blue-600"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                            preferences.appointmentReminders
                                                ? "translate-x-7"
                                                : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Vaccination Reminders */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Vaccination Reminders</h3>
                                    <p className="text-sm text-gray-600 mt-1">Get email notifications for vaccinations due soon</p>
                                </div>
                                <button
                                    onClick={() => handleToggle("vaccinationReminders")}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                        preferences.vaccinationReminders
                                            ? "bg-blue-600"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                            preferences.vaccinationReminders
                                                ? "translate-x-7"
                                                : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="rounded-lg text-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            {loading ? "Saving..." : "Save Preferences"}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
