"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Upload, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { compressImage, validateImageFile } from "@/lib/image-utils"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = async (file: File) => {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    try {
      // Show loading state while compressing
      const compressedImage = await compressImage(file)
      onImageUpload(compressedImage)
    } catch (error) {
      console.error("Error processing image:", error)
      alert("Failed to process image. Please try again.")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <div
      className={`text-center p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
        isDragOver ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-green-400 hover:bg-green-50"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-green-100 rounded-full">
            <Camera className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload a photo of your food</h3>
          <p className="text-gray-600 mb-4">Drag and drop an image here, or click to select</p>
        </div>

        <Button size="lg" className="bg-green-600 hover:bg-green-700">
          <Upload className="h-4 w-4 mr-2" />
          Choose Image
        </Button>

        <p className="text-xs text-gray-500">Supports JPG, PNG, WebP • Max 10MB</p>
      </div>
    </div>
  )
}
