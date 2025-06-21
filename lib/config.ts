export function validateEnvironment() {
  if (!process.env.google_api_key) {
    throw new Error("google_api_key environment variable is required")
  }
}

export const config = {
  googleApiKey: process.env.google_api_key!,
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxImageWidth: 800,
  imageQuality: 0.8,
} as const
