import { useState } from "react"
import { useLocation } from "react-router-dom"
import { Check, Calendar, Users, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { bookingsApi } from "@/lib/api-local"

const tours = [
  { id: 1, title: "Akagera National Park Safari", duration: "2-3 Days", price: 350 },
  { id: 2, title: "Gorilla Trekking Experience", duration: "Full Day", price: 1500 },
  { id: 3, title: "Nyungwe Forest Adventure", duration: "2 Days", price: 280 },
  { id: 4, title: "Kigali City Tour", duration: "Half Day", price: 75 },
  { id: 5, title: "Complete Rwanda Experience", duration: "7 Days", price: 3500 }
]

export function Book() {
  const location = useLocation()
  const preselectedTour = location.state?.selectedTour

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    tourId: preselectedTour?.id || "",
    date: "",
    guests: 2,
    name: "",
    email: "",
    phone: "",
    requests: ""
  })

  const selectedTour = tours.find(tour => tour.id === parseInt(formData.tourId))
  const totalPrice = selectedTour ? selectedTour.price * formData.guests : 0

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep === 2) {
      try {
        await bookingsApi.create({
          tour_id: parseInt(formData.tourId),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          guests: formData.guests,
          special_requests: formData.requests,
          total_price: totalPrice
        })
        setCurrentStep(3)
      } catch (error) {
        console.error('Booking failed:', error)
        alert('Booking failed. Please try again.')
      }
    }
  }

  const steps = [
    { number: 1, title: "Select Tour", description: "Choose your adventure" },
    { number: 2, title: "Your Details", description: "Tell us about yourself" },
    { number: 3, title: "Confirmation", description: "You're all set!" }
  ]

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
              Book Your <span className="text-safari-gold italic">Safari</span>
            </h1>
            <p className="text-xl text-safari-sand max-w-3xl mx-auto">
              Ready for an unforgettable adventure? Follow these simple steps to book 
              your perfect Rwanda safari experience with Wildbeat Tours.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="safari-section">
        <div className="safari-container max-w-4xl">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.number
                        ? 'bg-safari-gold text-safari-cream'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <div className="font-semibold text-sm text-safari-brown">
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-4 ${
                      currentStep > step.number ? 'bg-safari-gold' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <Card>
            <CardContent className="p-8">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-serif font-semibold text-safari-brown mb-6">
                    Step 1: Select Your Tour
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    {tours.map((tour) => (
                      <label
                        key={tour.id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.tourId === tour.id.toString()
                            ? 'border-safari-gold bg-safari-cream'
                            : 'border-gray-200 hover:border-safari-gold'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tour"
                          value={tour.id}
                          checked={formData.tourId === tour.id.toString()}
                          onChange={(e) => setFormData({ ...formData, tourId: e.target.value })}
                          className="sr-only"
                        />
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-safari-brown">{tour.title}</h3>
                            <p className="text-sm text-gray-600">{tour.duration}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-safari-gold">${tour.price}</div>
                            <div className="text-sm text-gray-600">per person</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-safari-brown mb-2">
                        Preferred Date *
                      </label>
                      <Input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-safari-brown mb-2">
                        Number of Guests *
                      </label>
                      <select
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                        className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleNext}
                      disabled={!formData.tourId || !formData.date}
                      variant="safari"
                      size="lg"
                    >
                      Next Step
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-serif font-semibold text-safari-brown mb-6">
                    Step 2: Your Details
                  </h2>

                  {selectedTour && (
                    <div className="bg-safari-cream p-6 rounded-lg mb-6">
                      <h3 className="font-semibold text-safari-brown mb-4">Booking Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Tour:</span>
                          <span className="font-medium">{selectedTour.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span className="font-medium">{formData.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Guests:</span>
                          <span className="font-medium">{formData.guests}</span>
                        </div>
                        <div className="flex justify-between border-t border-safari-gold/20 pt-2 font-semibold">
                          <span>Total Price:</span>
                          <span className="text-safari-gold">${totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-safari-brown mb-2">
                          Full Name *
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
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-safari-brown mb-2">
                        Special Requests or Dietary Requirements
                      </label>
                      <Textarea
                        value={formData.requests}
                        onChange={(e) => setFormData({ ...formData, requests: e.target.value })}
                        placeholder="Any special requests, dietary requirements, or accessibility needs..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" onClick={handleBack} variant="outline">
                        Back
                      </Button>
                      <Button type="submit" variant="safari" size="lg">
                        Confirm Booking
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-safari-gold rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-safari-cream" />
                  </div>
                  
                  <h2 className="text-3xl font-serif font-semibold text-safari-brown mb-4">
                    Booking Confirmed!
                  </h2>
                  
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Thank you for choosing Wildbeat Safari Tours! We've received your booking 
                    request and will contact you within 24 hours to confirm all details and 
                    arrange payment.
                  </p>

                  <div className="bg-safari-cream p-6 rounded-lg mb-8 max-w-md mx-auto">
                    <h3 className="font-semibold text-safari-brown mb-4">What's Next?</h3>
                    <ul className="text-sm text-gray-600 space-y-2 text-left">
                      <li>• You'll receive a confirmation email shortly</li>
                      <li>• We'll call you within 24 hours to discuss details</li>
                      <li>• Payment instructions will be provided</li>
                      <li>• Final itinerary will be sent before your trip</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={() => {
                        setCurrentStep(1)
                        setFormData({
                          tourId: "",
                          date: "",
                          guests: 2,
                          name: "",
                          email: "",
                          phone: "",
                          requests: ""
                        })
                      }}
                      variant="safari"
                      size="lg"
                    >
                      Book Another Safari
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}