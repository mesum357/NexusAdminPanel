// Get the API base URL from environment variable or use Railway backend
const getApiBaseUrl = () => {
  // Use Railway backend URL as the primary backend
  const railwayUrl = 'https://nexusbackend-production.up.railway.app'
  const apiUrl = import.meta.env.VITE_API_BASE_URL || railwayUrl
  
  console.log('🔗 API Base URL:', apiUrl)
  console.log('🔗 Environment:', import.meta.env.MODE)
  console.log('🔗 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
  
  return apiUrl
}

export const API_BASE_URL = getApiBaseUrl()

// Log the final API URL for debugging
console.log('🚀 Final API_BASE_URL:', API_BASE_URL)