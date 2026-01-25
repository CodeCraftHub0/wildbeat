import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Tour = {
  id: number
  title: string
  description: string
  price: number
  duration: string
  group_size: string
  location: string
  highlights: string[]
  image_url: string
  rating: number
  created_at: string
  updated_at: string
}

export type Booking = {
  id?: number
  tour_id: number
  name: string
  email: string
  phone: string
  date: string
  guests: number
  special_requests?: string
  status?: string
  total_price: number
  created_at?: string
}

export type Review = {
  id?: number
  tour_id: number
  name: string
  email: string
  rating: number
  review_text: string
  approved?: boolean
  created_at?: string
}

export type GalleryImage = {
  id: number
  title: string
  image_url: string
  category: string
  alt_text: string
  created_at: string
}

export type Donation = {
  id?: number
  name?: string
  email?: string
  amount: number
  tier?: string
  message?: string
  created_at?: string
}