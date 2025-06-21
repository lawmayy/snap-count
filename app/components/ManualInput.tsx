"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Search } from "lucide-react"

interface ManualInputProps {
  onSubmit: (description: string) => void
  onCancel: () => void
  isLoading: boolean
}

export default function ManualInput({ onSubmit, onCancel, isLoading }: ManualInputProps) {
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (description.trim()) {
      onSubmit(description.trim())
    }
  }

  const suggestions = [
    "Grilled chicken breast with rice",
    "Caesar salad with dressing",
    "Chocolate chip cookie",
    "Banana smoothie",
    "Pasta with marinara sauce",
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-orange-600">
          <AlertCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Couldn&apos;t detect the food?</h2>
        </div>
        <p className="text-gray-600">
          No worries! Describe what you&apos;re eating and we&apos;ll estimate the calories.
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Describe Your Food</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="food-description" className="text-sm font-medium">
                What are you eating?
              </Label>
              <Input
                id="food-description"
                type="text"
                placeholder="e.g., Grilled salmon with vegetables"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!description.trim() || isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Get Estimate
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Need inspiration? Try these examples:</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setDescription(suggestion)}
                disabled={isLoading}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
