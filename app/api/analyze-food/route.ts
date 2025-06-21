import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.google_api_key!) // <-- uses the real env var

export async function POST(request: NextRequest) {
  try {
    const { image, description } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    let result

    if (image) {
      // Handle image analysis
      const base64Data = image.split(",")[1]
      const mimeType = image.split(";")[0].split(":")[1]

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      }

      const prompt = `Analyze this food image and provide nutritional information. Please respond with ONLY a JSON object in this exact format:

{
  "foodName": "descriptive name of the food",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "sugar": number (in grams),
  "confidence": number (between 0 and 1)
}

If you cannot clearly identify the food or if the image doesn't contain food, respond with:
{
  "error": "Could not identify food in image"
}

Be as accurate as possible with portion size estimation. Consider typical serving sizes for the identified food items.`

      result = await model.generateContent([prompt, imagePart])
    } else if (description) {
      // Handle text description
      const prompt = `Based on this food description: "${description}", provide nutritional information. Please respond with ONLY a JSON object in this exact format:

{
  "foodName": "${description}",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "sugar": number (in grams),
  "confidence": number (between 0 and 1, typically 0.7 for text descriptions)
}

Assume a typical serving size for the described food. Be as accurate as possible with nutritional values.`

      result = await model.generateContent(prompt)
    } else {
      return NextResponse.json({ error: "No image or description provided" }, { status: 400 })
    }

    const response = await result.response
    const text = response.text()

    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }

      const nutritionData = JSON.parse(jsonMatch[0])

      // Validate the response structure
      if (nutritionData.error) {
        return NextResponse.json({ error: nutritionData.error })
      }

      // Ensure all required fields are present and are numbers
      const requiredFields = ["calories", "protein", "carbs", "fat", "sugar", "confidence"]
      for (const field of requiredFields) {
        if (typeof nutritionData[field] !== "number") {
          throw new Error(`Invalid or missing ${field}`)
        }
      }

      // Round values to reasonable precision
      nutritionData.calories = Math.round(nutritionData.calories)
      nutritionData.protein = Math.round(nutritionData.protein * 10) / 10
      nutritionData.carbs = Math.round(nutritionData.carbs * 10) / 10
      nutritionData.fat = Math.round(nutritionData.fat * 10) / 10
      nutritionData.sugar = Math.round(nutritionData.sugar * 10) / 10
      nutritionData.confidence = Math.round(nutritionData.confidence * 100) / 100

      return NextResponse.json(nutritionData)
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text)
      return NextResponse.json({
        error: "Could not analyze the food. Please try describing it manually.",
      })
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json({ error: "Failed to analyze food. Please try again." }, { status: 500 })
  }
}
