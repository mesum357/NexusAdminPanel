// Get the API base URL from environment variable or use appropriate backend
const getApiBaseUrl = () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development'
  
  // Use local backend for development, Railway for production
  const localUrl = 'http://localhost:5000'
  const railwayUrl = 'https://nexusbackend-production.up.railway.app'
  
  // Allow environment variable override
  const apiUrl = import.meta.env.VITE_API_BASE_URL || (isDevelopment ? localUrl : railwayUrl)
  
  console.log('🔗 API Base URL:', apiUrl)
  console.log('🔗 Environment:', import.meta.env.MODE)
  console.log('🔗 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
  console.log('🔗 Using backend:', isDevelopment ? 'Local (localhost:5000)' : 'Railway (Production)')
  
  return apiUrl
}

export const API_BASE_URL = getApiBaseUrl()

// Log the final API URL for debugging
console.log('🚀 Final API_BASE_URL:', API_BASE_URL)