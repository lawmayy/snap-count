export function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
      resolve(compressedDataUrl)
    }

    img.src = URL.createObjectURL(file)
  })
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Please select an image file" }
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: "Image must be smaller than 10MB" }
  }

  return { valid: true }
}
