// Get the API base URL from environment variable or use fallback
const getApiBaseUrl = () => {
  // Check if we're in production and have the environment variable
  if (import.meta.env.PROD) {
    // In production, use the environment variable or fallback to backend URL
    return import.meta.env.VITE_API_BASE_URL || 'https://nexusbackend-production.up.railway.app'
  }
  // In development, use localhost
  return 'http://localhost:5000'
}

export const API_BASE_URL = getApiBaseUrl()