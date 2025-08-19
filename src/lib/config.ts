// Get the API base URL from environment variable or use fallback
const getApiBaseUrl = () => {
  // Check if we're in production and have the environment variable
  if (import.meta.env.PROD) {
    // In production, use the environment variable or fallback to backend URL
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://nexusbackend-production.up.railway.app'
    console.log('🔗 API Base URL:', apiUrl)
    console.log('🔗 Environment:', import.meta.env.MODE)
    console.log('🔗 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
    return apiUrl
  }
  // In development, use localhost with correct backend port
  const devUrl = 'http://localhost:8080'
  console.log('🔗 Development API URL:', devUrl)
  return devUrl
}

export const API_BASE_URL = getApiBaseUrl()

// Log the final API URL for debugging
console.log('🚀 Final API_BASE_URL:', API_BASE_URL)