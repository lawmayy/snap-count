"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Edit3, Zap, Plus } from "lucide-react"
import type { NutritionData } from "../page"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface ResultsDisplayProps {
  data: NutritionData
  onReset: () => void
  onManualInput: () => void
  showAddButton?: boolean
  onAddToLog?: () => void
  onDataUpdate?: (newData: NutritionData) => void
}

export default function ResultsDisplay({
  data,
  onReset,
  onManualInput,
  showAddButton = false,
  onAddToLog,
  onDataUpdate,
}: ResultsDisplayProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedFoodName, setEditedFoodName] = useState(data.foodName)
  const [isRecalculating, setIsRecalculating] = useState(false)

  const getConfidenceInfo = (confidence: number) => {
    if (confidence >= 0.8) {
      return { color: "bg-green-500", text: "High", description: "Very confident in this analysis" }
    } else if (confidence >= 0.6) {
      return { color: "bg-yellow-500", text: "Medium", description: "Reasonably confident in this analysis" }
    } else {
      return {
        color: "bg-orange-500",
        text: "Low",
        description: "Less confident - consider manual input for better accuracy",
      }
    }
  }

  const confidenceInfo = getConfidenceInfo(data.confidence)

  const handleRecalculate = async () => {
    if (!editedFoodName.trim() || editedFoodName === data.foodName) {
      setIsEditing(false)
      return
    }

    setIsRecalculating(true)

    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: editedFoodName.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to recalculate")
      }

      const newData = await response.json()

      // Update the data with new calculations but keep the user's food name
      const updatedData = {
        ...newData,
        foodName: editedFoodName.trim(),
        confidence: 0.8, // Set confidence to 0.8 for user-corrected entries
      }

      // Call a new prop to update the parent component
      if (onDataUpdate) {
        onDataUpdate(updatedData)
      }

      setIsEditing(false)
    } catch (error) {
      console.error("Recalculation error:", error)
      alert("Failed to recalculate. Please try again.")
    } finally {
      setIsRecalculating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Analysis Complete</h2>
        </div>
        <Badge variant="secondary" className={`${confidenceInfo.color} text-white`} title={confidenceInfo.description}>
          {confidenceInfo.text} Confidence ({Math.round(data.confidence * 100)}%)
        </Badge>
      </div>

      {/* Food Name - Editable */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6 text-center">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="food-name-edit" className="block text-sm font-medium text-gray-700 mb-2">
                  Correct the food description:
                </label>
                <Input
                  id="food-name-edit"
                  value={editedFoodName}
                  onChange={(e) => setEditedFoodName(e.target.value)}
                  placeholder="Enter the correct food name"
                  className="text-center"
                  disabled={isRecalculating}
                />
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleRecalculate}
                  disabled={isRecalculating || !editedFoodName.trim()}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isRecalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2" />
                      Recalculating...
                    </>
                  ) : (
                    "Recalculate"
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false)
                    setEditedFoodName(data.foodName)
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isRecalculating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-xl font-semibold text-gray-900">{data.foodName}</h3>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  title="Edit food description"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {data.calories} <span className="text-lg font-normal text-gray-600">calories</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Macronutrients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nutritional Breakdown (Calories)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{Math.round(data.protein * 4)}</div>
              <div className="text-sm text-gray-600">Protein ({data.protein}g)</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{Math.round(data.carbs * 4)}</div>
              <div className="text-sm text-gray-600">Carbs ({data.carbs}g)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round(data.fat * 9)}</div>
              <div className="text-sm text-gray-600">Fat ({data.fat}g)</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">{Math.round(data.sugar * 4)}</div>
              <div className="text-sm text-gray-600">Sugar ({data.sugar}g)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800 text-center">
            <strong>Note:</strong> These are estimates based on visual analysis. Actual values may vary depending on
            preparation methods and ingredients.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {showAddButton && onAddToLog && (
          <Button onClick={onAddToLog} size="lg" className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Add to Daily Log
          </Button>
        )}
        <Button onClick={onReset} variant="outline" size="lg" className="flex-1 sm:flex-none">
          <RotateCcw className="h-4 w-4 mr-2" />
          Analyze Another Photo
        </Button>
        <Button onClick={onManualInput} variant="outline" size="lg" className="flex-1 sm:flex-none">
          <Edit3 className="h-4 w-4 mr-2" />
          Describe Food Manually
        </Button>
      </div>
    </div>
  )
}
