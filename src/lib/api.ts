import { supabase, type Tour, type Booking, type Review, type GalleryImage, type Donation } from './supabase'

// Tours API
export const toursApi = {
  getAll: async (): Promise<Tour[]> => {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  getById: async (id: number): Promise<Tour | null> => {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// Bookings API
export const bookingsApi = {
  create: async (booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> => {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Reviews API
export const reviewsApi = {
  getApproved: async (): Promise<Review[]> => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  create: async (review: Omit<Review, 'id' | 'created_at' | 'approved'>): Promise<Review> => {
    const { data, error } = await supabase
      .from('reviews')
      .insert({ ...review, approved: false })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Gallery API
export const galleryApi = {
  getAll: async (): Promise<GalleryImage[]> => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  getByCategory: async (category: string): Promise<GalleryImage[]> => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Donations API
export const donationsApi = {
  create: async (donation: Omit<Donation, 'id' | 'created_at'>): Promise<Donation> => {
    const { data, error } = await supabase
      .from('donations')
      .insert(donation)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}