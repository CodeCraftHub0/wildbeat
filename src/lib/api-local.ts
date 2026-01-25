const defaultBaseUrl = 'http://localhost:3001/api'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || defaultBaseUrl).replace(/\/$/, '')

export const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`

// API helper function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(apiUrl(endpoint), {
    ...options,
    headers
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}

// Tours API
export const toursApi = {
  getAll: async () => {
    return apiCall('/tours')
  },

  getById: async (id: number) => {
    return apiCall(`/tours/${id}`)
  }
}

// Bookings API
export const bookingsApi = {
  create: async (booking: any) => {
    return apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    })
  },

  getAll: async () => {
    return apiCall('/bookings')
  }
}

// Reviews API
export const reviewsApi = {
  getApproved: async () => {
    return apiCall('/reviews')
  },

  create: async (review: any) => {
    return apiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    })
  }
}

// Gallery API
export const galleryApi = {
  getAll: async () => {
    return apiCall('/gallery')
  },

  getByCategory: async (category: string) => {
    return apiCall(`/gallery?category=${category}`)
  },

  create: async (photo: any) => {
    return apiCall('/gallery', {
      method: 'POST',
      body: JSON.stringify(photo),
    })
  }
}

// Donations API
export const donationsApi = {
  create: async (donation: any) => {
    return apiCall('/donations', {
      method: 'POST',
      body: JSON.stringify(donation),
    })
  },

  getAll: async () => {
    return apiCall('/donations')
  }
}