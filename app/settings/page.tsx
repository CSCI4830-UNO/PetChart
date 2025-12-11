"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bell, Moon, Sun, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    appointmentReminders: true,
    vaccinationReminders: true,
    fleaTickReminders: true,
  });

  // Redirect if not authenticated
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
          setPreferences(data.notificationPreferences);
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };

    fetchPreferences();
  }, [session]);

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationPreferences: preferences,
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

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-[#18191a] dark:bg-[#18191a] dark:bg-[#18191a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-[#18191a] dark:via-[#18191a] dark:to-[#242526]">
      {/* Header */}
      <header className="bg-white dark:bg-[#18191a] dark:bg-[#18191a] dark:bg-[#242526] shadow-sm border-b border-gray-200 dark:border-[#3a3b3c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4 dark:text-gray-200 dark:hover:bg-[#3a3b3c]"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Theme Settings */}
          <Card className="dark:bg-[#242526] dark:border-[#3a3b3c]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Moon size={20} />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base dark:text-gray-200">Theme</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Choose how PetChart looks to you. Select a single theme, or sync with your system.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      theme === "light"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950 dark:border-blue-500"
                        : "border-gray-200 dark:border-[#3a3b3c] hover:border-gray-300 dark:hover:border-[#4e4f50] bg-white dark:bg-[#18191a] dark:bg-[#18191a] dark:bg-[#18191a]"
                    }`}
                  >
                    <Sun size={24} className={theme === "light" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"} />
                    <span className={`text-sm font-medium ${theme === "light" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                      Light
                    </span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      theme === "dark"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950 dark:border-blue-500"
                        : "border-gray-200 dark:border-[#3a3b3c] hover:border-gray-300 dark:hover:border-[#4e4f50] bg-white dark:bg-[#18191a] dark:bg-[#18191a] dark:bg-[#18191a]"
                    }`}
                  >
                    <Moon size={24} className={theme === "dark" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"} />
                    <span className={`text-sm font-medium ${theme === "dark" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                      Dark
                    </span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      theme === "system"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950 dark:border-blue-500"
                        : "border-gray-200 dark:border-[#3a3b3c] hover:border-gray-300 dark:hover:border-[#4e4f50] bg-white dark:bg-[#18191a] dark:bg-[#18191a] dark:bg-[#18191a]"
                    }`}
                  >
                    <Monitor size={24} className={theme === "system" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"} />
                    <span className={`text-sm font-medium ${theme === "system" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                      System
                    </span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="dark:bg-[#242526] dark:border-[#3a3b3c]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Bell size={20} />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base dark:text-gray-200">Appointment Reminders</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about upcoming appointments
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.appointmentReminders}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      appointmentReminders: e.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-[#3a3b3c] dark:bg-[#18191a]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base dark:text-gray-200">Vaccination Reminders</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when vaccinations are due
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.vaccinationReminders}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      vaccinationReminders: e.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-[#3a3b3c] dark:bg-[#18191a]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base dark:text-gray-200">Flea & Tick Reminders</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about flea & tick treatments
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.fleaTickReminders}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      fleaTickReminders: e.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-[#3a3b3c] dark:bg-[#18191a]"
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="dark:bg-[#242526] dark:border-[#3a3b3c]">
            <CardHeader>
              <CardTitle className="dark:text-white">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">Name</Label>
                <p className="text-base font-medium dark:text-gray-200">{session.user?.name}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">Email</Label>
                <p className="text-base font-medium dark:text-gray-200">{session.user?.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

