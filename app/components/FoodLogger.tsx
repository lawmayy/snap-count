"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import ImageUpload from "./ImageUpload"
import ResultsDisplay from "./ResultsDisplay"
import ManualInput from "./ManualInput"
import type { NutritionData } from "../page"
import { useEffect, useState } from "react"
import Image from "next/image"

interface FoodLoggerProps {
  uploadedImage: string | null
  isAnalyzing: boolean
  results: NutritionData | null
  showManualInput: boolean
  error: string | null
  onImageUpload: (imageUrl: string) => void
  onAnalyze: () => void
  onManualSubmit: (description: string) => void
  onAddToLog: (data: NutritionData) => void
  onReset: () => void
  onShowManualInput: () => void
}

export default function FoodLogger({
  uploadedImage,
  isAnalyzing,
  results,
  showManualInput,
  error,
  onImageUpload,
  onAnalyze,
  onManualSubmit,
  onAddToLog,
  onReset,
  onShowManualInput,
}: FoodLoggerProps) {
  const [currentResults, setCurrentResults] = useState<NutritionData | null>(results)

  useEffect(() => {
    setCurrentResults(results)
  }, [results])

  const handleDataUpdate = (newData: NutritionData) => {
    setCurrentResults(newData)
  }

  return (
    <div className="space-y-6">
      {!uploadedImage && !results && !showManualInput && (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="p-8">
            <ImageUpload onImageUpload={onImageUpload} />
            <div className="text-center mt-6">
              <div className="text-gray-500 mb-4">or</div>
              <Button onClick={onShowManualInput} variant="outline" size="lg">
                Describe Food Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadedImage && !results && !showManualInput && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Image
                src={uploadedImage || "/placeholder.svg"}
                alt="Uploaded food"
                width={400}
                height={300}
                className="max-w-full max-h-96 mx-auto rounded-lg shadow-md object-contain"
              />
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Analyze Food
                    </>
                  )}
                </Button>
                <Button onClick={onReset} variant="outline" size="lg">
                  Upload Different Image
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showManualInput && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <ManualInput
              onSubmit={onManualSubmit}
              onCancel={() => {
                if (uploadedImage) {
                  onShowManualInput()
                } else {
                  onReset()
                }
              }}
              isLoading={isAnalyzing}
            />
          </CardContent>
        </Card>
      )}

      {currentResults && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <ResultsDisplay
              data={currentResults}
              onReset={onReset}
              onManualInput={onShowManualInput}
              showAddButton={true}
              onAddToLog={() => onAddToLog(currentResults)}
              onDataUpdate={handleDataUpdate}
            />
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-600 text-center">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
