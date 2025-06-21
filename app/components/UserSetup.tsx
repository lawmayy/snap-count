"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, User } from "lucide-react"
import type { UserProfile } from "../page"

interface UserSetupProps {
  onComplete: (profile: UserProfile) => void
  existingProfile: UserProfile | null
}

export default function UserSetup({ onComplete, existingProfile }: UserSetupProps) {
  const [age, setAge] = useState(existingProfile?.age?.toString() || "")
  const [height, setHeight] = useState(existingProfile?.height_cm?.toString() || "")
  const [weight, setWeight] = useState(existingProfile?.weight_kg?.toString() || "")
  const [activityLevel, setActivityLevel] = useState(existingProfile?.activity_level || "")
  const [gender, setGender] = useState("male") // For BMR calculation

  const calculateBMR = (age: number, height: number, weight: number, gender: string): number => {
    // Mifflin-St Jeor Equation
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161
    }
  }

  const getActivityMultiplier = (level: string): number => {
    switch (level) {
      case "sedentary":
        return 1.2
      case "light":
        return 1.375
      case "moderate":
        return 1.55
      case "active":
        return 1.725
      case "very_active":
        return 1.9
      default:
        return 1.2
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const ageNum = Number.parseInt(age)
    const heightNum = Number.parseInt(height)
    const weightNum = Number.parseInt(weight)

    if (!ageNum || !heightNum || !weightNum || !activityLevel) {
      alert("Please fill in all fields")
      return
    }

    const bmr = calculateBMR(ageNum, heightNum, weightNum, gender)
    const dailyCalories = Math.round(bmr * getActivityMultiplier(activityLevel))

    const profile: UserProfile = {
      age: ageNum,
      height_cm: heightNum,
      weight_kg: weightNum,
      activity_level: activityLevel,
      daily_calorie_goal: dailyCalories,
    }

    onComplete(profile)
  }

  const activityOptions = [
    { value: "sedentary", label: "Sedentary (little/no exercise)" },
    { value: "light", label: "Light (light exercise 1-3 days/week)" },
    { value: "moderate", label: "Moderate (moderate exercise 3-5 days/week)" },
    { value: "active", label: "Active (hard exercise 6-7 days/week)" },
    { value: "very_active", label: "Very Active (very hard exercise, physical job)" },
  ]

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <User className="h-6 w-6 text-green-600" />
          <CardTitle className="text-2xl">{existingProfile ? "Update Your Profile" : "Set Up Your Profile"}</CardTitle>
        </div>
        <p className="text-gray-600">We'll calculate your daily calorie needs</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="16"
                max="100"
                required
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="120"
                max="250"
                required
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="30"
                max="300"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="activity">Activity Level</Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select your activity level" />
              </SelectTrigger>
              <SelectContent>
                {activityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {age && height && weight && activityLevel && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Your Daily Calorie Goal</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(
                    calculateBMR(Number.parseInt(age), Number.parseInt(height), Number.parseInt(weight), gender) *
                      getActivityMultiplier(activityLevel),
                  )}{" "}
                  calories
                </div>
                <p className="text-sm text-green-700 mt-1">Based on your age, height, weight, and activity level</p>
              </CardContent>
            </Card>
          )}

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg">
            {existingProfile ? "Update Profile" : "Start Tracking"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
