"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Settings, Calendar, Target } from "lucide-react"
import type { UserProfile, FoodEntry } from "../page"

interface DailyTrackerProps {
  userProfile: UserProfile
  dailyEntries: FoodEntry[]
  totalCalories: number
  remainingCalories: number
  onStartLogging: () => void
  onDeleteEntry: (entryId: string) => void
  onEditProfile: () => void
}

export default function DailyTracker({
  userProfile,
  dailyEntries,
  totalCalories,
  remainingCalories,
  onStartLogging,
  onDeleteEntry,
  onEditProfile,
}: DailyTrackerProps) {
  const progressPercentage = Math.min((totalCalories / userProfile.daily_calorie_goal) * 100, 100)
  const isOverGoal = totalCalories > userProfile.daily_calorie_goal

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getProgressColor = () => {
    if (isOverGoal) return "bg-red-500"
    if (progressPercentage > 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-6">
      {/* Header with Profile Info */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Today&apos;s Progress</h2>
            </div>
            <Button onClick={onEditProfile} variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userProfile.daily_calorie_goal}</div>
              <div className="text-sm text-gray-600">Daily Goal</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalCalories}</div>
              <div className="text-sm text-gray-600">Consumed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className={`text-2xl font-bold ${isOverGoal ? "text-red-600" : "text-purple-600"}`}>
                {isOverGoal ? `+${Math.abs(remainingCalories)}` : remainingCalories}
              </div>
              <div className="text-sm text-gray-600">{isOverGoal ? "Over Goal" : "Remaining"}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Food Button */}
      <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-green-200">
        <CardContent className="p-6 text-center">
          <Button onClick={onStartLogging} size="lg" className="bg-green-600 hover:bg-green-700">
            <Plus className="h-5 w-5 mr-2" />
            Add Food
          </Button>
          <p className="text-sm text-gray-600 mt-2">Upload a photo or describe what you're eating</p>
        </CardContent>
      </Card>

      {/* Food Log */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Today&apos;s Food Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No food logged yet today</p>
              <p className="text-sm">Start by adding your first meal!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dailyEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{entry.food_name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {entry.source === "image" ? "📷" : "✏️"}
                      </Badge>
                      {entry.food_name !== entry.original_name && (
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                          Edited
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(entry.timestamp)} • {entry.calories} cal
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      P: {Math.round(entry.protein * 4)}cal • C: {Math.round(entry.carbs * 4)}cal • F:{" "}
                      {Math.round(entry.fat * 9)}cal • S: {Math.round(entry.sugar * 4)}cal
                    </div>
                  </div>
                  <Button
                    onClick={() => onDeleteEntry(entry.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Summary */}
      {dailyEntries.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Daily Totals</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(dailyEntries.reduce((sum, entry) => sum + entry.protein * 4, 0))}
                </div>
                <div className="text-xs text-gray-600">Protein (cal)</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {Math.round(dailyEntries.reduce((sum, entry) => sum + entry.carbs * 4, 0))}
                </div>
                <div className="text-xs text-gray-600">Carbs (cal)</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(dailyEntries.reduce((sum, entry) => sum + entry.fat * 9, 0))}
                </div>
                <div className="text-xs text-gray-600">Fat (cal)</div>
              </div>
              <div>
                <div className="text-lg font-bold text-pink-600">
                  {Math.round(dailyEntries.reduce((sum, entry) => sum + entry.sugar * 4, 0))}
                </div>
                <div className="text-xs text-gray-600">Sugar (cal)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
