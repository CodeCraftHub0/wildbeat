import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { reviewsApi } from "@/lib/api-local"

const reviews: any[] = []

export function Reviews() {
  const tours = [
    { id: 1, title: "Akagera National Park Safari" },
    { id: 2, title: "Gorilla Trekking Experience" },
    { id: 3, title: "Nyungwe Forest Adventure" },
    { id: 4, title: "Kigali City Tour" },
    { id: 5, title: "Complete Rwanda Experience" }
  ]

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tour: "",
    rating: 5,
    review: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await reviewsApi.create({
        tour_id: tours.find(t => t.title === formData.tour)?.id || 1,
        name: formData.name,
        email: formData.email,
        rating: formData.rating,
        review_text: formData.review
      })
      
      alert('Review submitted successfully! It will appear after approval.')
      setFormData({
        name: "",
        email: "",
        tour: "",
        rating: 5,
        review: ""
      })
    } catch (error) {
      console.error('Review submission failed:', error)
      alert('Failed to submit review. Please try again.')
    }
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  return (
    <div className="pt-16">
      <section className="relative py-24 bg-safari-brown">
        <div className="safari-container text-center text-safari-cream">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="safari-heading mb-6">
              Guest <span className="text-safari-gold italic">Reviews</span>
            </h1>
            <p className="text-xl text-safari-sand max-w-3xl mx-auto mb-8">
              Read what fellow adventurers have to say about their safari experiences 
              with Wildbeat Tours across Rwanda's incredible landscapes.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(averageRating)
                        ? 'text-safari-gold fill-current'
                        : 'text-safari-sand'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-safari-gold">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-safari-sand">
                ({reviews.length} reviews)
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="safari-section">
        <div className="safari-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-safari-gold fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 mb-6 italic">
                      "{review.text}"
                    </blockquote>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="font-semibold text-safari-brown">
                        {review.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {review.location}
                      </div>
                      <div className="text-xs text-safari-gold mt-1">
                        {review.tour} • {review.date}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-safari-cream rounded-lg p-8"
          >
            <h2 className="text-3xl font-serif font-semibold text-safari-brown mb-6 text-center">
              Share Your Experience
            </h2>
            <p className="safari-text text-center mb-8 max-w-2xl mx-auto">
              We'd love to hear about your safari adventure! Your feedback helps us 
              improve our services and helps other travelers plan their perfect Rwanda experience.
            </p>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-safari-brown mb-2">
                    Your Name *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-safari-brown mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-safari-brown mb-2">
                  Which tour did you take? *
                </label>
                <select
                  required
                  value={formData.tour}
                  onChange={(e) => setFormData({ ...formData, tour: e.target.value })}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a tour</option>
                  <option value="Akagera National Park Safari">Akagera National Park Safari</option>
                  <option value="Gorilla Trekking Experience">Gorilla Trekking Experience</option>
                  <option value="Nyungwe Forest Adventure">Nyungwe Forest Adventure</option>
                  <option value="Kigali City Tour">Kigali City Tour</option>
                  <option value="Complete Rwanda Experience">Complete Rwanda Experience</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-safari-brown mb-2">
                  Rating *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? 'text-safari-gold fill-current'
                            : 'text-gray-300'
                        } hover:text-safari-gold transition-colors`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-safari-brown mb-2">
                  Your Review *
                </label>
                <Textarea
                  required
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  placeholder="Tell us about your safari experience..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="text-center">
                <Button type="submit" variant="safari" size="lg">
                  Submit Review
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}