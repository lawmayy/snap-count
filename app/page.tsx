"use client"

import { useState, useEffect } from "react"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import UserSetup from "./components/UserSetup"
import DailyTracker from "./components/DailyTracker"
import FoodLogger from "./components/FoodLogger"
import { useLocalStorage } from "./hooks/useLocalStorage"

export interface NutritionData {
  foodName: string
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
  confidence: number
}

export interface UserProfile {
  age: number
  height_cm: number
  weight_kg: number
  activity_level: string
  daily_calorie_goal: number
}

export interface FoodEntry {
  id: string
  timestamp: number
  food_name: string
  original_name?: string // Track the original AI-detected name
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
  source: "image" | "manual"
}

export default function HomePage() {
  // Update the useLocalStorage calls to destructure the isLoaded flag
  const [userProfile, setUserProfile, profileLoaded] = useLocalStorage<UserProfile | null>("snapcount_profile", null)
  const [dailyEntries, setDailyEntries, entriesLoaded] = useLocalStorage<FoodEntry[]>("snapcount_daily_entries", [])

  const [currentView, setCurrentView] = useState<"setup" | "tracker" | "logger">("setup")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<NutritionData | null>(null)
  const [showManualInput, setShowManualInput] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if entries are from today, reset if not
  useEffect(() => {
    const today = new Date().toDateString()
    const lastEntryDate = dailyEntries.length > 0 ? new Date(dailyEntries[0].timestamp).toDateString() : today

    if (lastEntryDate !== today) {
      setDailyEntries([])
    }
  }, [dailyEntries, setDailyEntries])

  // Add loading state check
  const isDataLoaded = profileLoaded && entriesLoaded

  // Update the initial view effect to wait for data to load
  useEffect(() => {
    if (!isDataLoaded) return // Wait for localStorage to load

    if (!userProfile) {
      setCurrentView("setup")
    } else {
      setCurrentView("tracker")
    }
  }, [userProfile, isDataLoaded])

  // Add loading screen at the beginning of the render
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading SnapCount...</p>
        </div>
      </div>
    )
  }

  const handleUserSetup = (profile: UserProfile) => {
    setUserProfile(profile)
    setCurrentView("tracker")
  }

  const handleStartLogging = () => {
    setCurrentView("logger")
    setUploadedImage(null)
    setResults(null)
    setShowManualInput(false)
    setError(null)
  }

  const handleBackToTracker = () => {
    setCurrentView("tracker")
    setUploadedImage(null)
    setResults(null)
    setShowManualInput(false)
    setError(null)
  }

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
    setResults(null)
    setShowManualInput(false)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!uploadedImage) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: uploadedImage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze image")
      }

      const data = await response.json()

      if (data.error) {
        setShowManualInput(true)
      } else {
        setResults(data)
      }
    } catch (err) {
      console.error("Analysis error:", err)
      setError("Failed to analyze image. Please try again or describe your food manually.")
      setShowManualInput(true)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleManualSubmit = async (description: string) => {
    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process description")
      }

      const data = await response.json()
      setResults(data)
      setShowManualInput(false)
    } catch (err) {
      console.error("Manual analysis error:", err)
      setError("Failed to process description. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAddToLog = (nutritionData: NutritionData) => {
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      food_name: nutritionData.foodName,
      original_name: uploadedImage ? results?.foodName : undefined, // Store original AI detection
      calories: nutritionData.calories,
      protein: nutritionData.protein,
      carbs: nutritionData.carbs,
      fat: nutritionData.fat,
      sugar: nutritionData.sugar,
      source: uploadedImage ? "image" : "manual",
    }

    setDailyEntries((prev) => [newEntry, ...prev])
    handleBackToTracker()
  }

  const handleDeleteEntry = (entryId: string) => {
    setDailyEntries((prev) => prev.filter((entry) => entry.id !== entryId))
  }

  const handleEditProfile = () => {
    setCurrentView("setup")
  }

  const totalCalories = dailyEntries.reduce((sum, entry) => sum + entry.calories, 0)
  const remainingCalories = userProfile ? userProfile.daily_calorie_goal - totalCalories : 0

  if (currentView === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-8 w-8 text-green-600" />
              <h1 className="text-4xl font-bold text-gray-900">SnapCount</h1>
            </div>
            <p className="text-xl text-gray-600 mb-2">Let&apos;s calculate your daily calorie needs</p>
          </div>

          <UserSetup onComplete={handleUserSetup} existingProfile={userProfile} />
        </div>
      </div>
    )
  }

  if (currentView === "tracker") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-8 w-8 text-green-600" />
              <h1 className="text-4xl font-bold text-gray-900">SnapCount</h1>
            </div>
            <p className="text-xl text-gray-600 mb-2">Your daily food tracker</p>
          </div>

          <DailyTracker
            userProfile={userProfile!}
            dailyEntries={dailyEntries}
            totalCalories={totalCalories}
            remainingCalories={remainingCalories}
            onStartLogging={handleStartLogging}
            onDeleteEntry={handleDeleteEntry}
            onEditProfile={handleEditProfile}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">SnapCount</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Add food to your daily log</p>
          <Button onClick={handleBackToTracker} variant="outline" className="mb-4">
            ← Back to Tracker
          </Button>
        </div>

        <FoodLogger
          uploadedImage={uploadedImage}
          isAnalyzing={isAnalyzing}
          results={results}
          showManualInput={showManualInput}
          error={error}
          onImageUpload={handleImageUpload}
          onAnalyze={handleAnalyze}
          onManualSubmit={handleManualSubmit}
          onAddToLog={handleAddToLog}
          onReset={() => {
            setUploadedImage(null)
            setResults(null)
            setShowManualInput(false)
            setError(null)
          }}
          onShowManualInput={() => setShowManualInput(true)}
        />
      </div>
    </div>
  )
}
