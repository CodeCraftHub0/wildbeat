import { Link } from "react-router-dom"
import { Clock, Users, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

const tours = [
  {
    id: 1,
    title: "Akagera National Park Safari",
    description: "Experience Rwanda's premier wildlife destination with game drives through savanna landscapes. Spot the Big Five including lions, elephants, rhinos, leopards, and buffalo. Enjoy boat safaris on Lake Ihema and witness spectacular sunrises over the African plains.",
    price: 350,
    duration: "2-3 Days",
    groupSize: "2-8 People",
    location: "Akagera National Park",
    highlights: ["Big Five wildlife viewing", "Boat safari on Lake Ihema", "Sunrise game drives", "Professional photography opportunities"],
    image: "/images/Akagera National Park.jpg",
    rating: 4.9
  },
  {
    id: 2,
    title: "Gorilla Trekking Experience",
    description: "Embark on a life-changing journey to meet mountain gorillas in their natural habitat at Volcanoes National Park. This UNESCO World Heritage site offers intimate encounters with these magnificent creatures in the misty mountains of Rwanda.",
    price: 1500,
    duration: "Full Day",
    groupSize: "1-8 People",
    location: "Volcanoes National Park",
    highlights: ["Mountain gorilla encounters", "Expert tracker guides", "Conservation education", "Certificate of participation"],
    image: "/images/gorilla-trekking.jpeg",
    rating: 5.0
  },
  {
    id: 3,
    title: "Nyungwe Forest Adventure",
    description: "Discover Rwanda's ancient rainforest with chimpanzee tracking, canopy walks, and waterfall hikes. Nyungwe National Park is home to 13 primate species and over 300 bird species in one of Africa's oldest forests.",
    price: 280,
    duration: "2 Days",
    groupSize: "2-6 People",
    location: "Nyungwe National Park",
    highlights: ["Chimpanzee tracking", "Canopy walkway experience", "Waterfall hikes", "Bird watching tours"],
    image: "/images/Nyungwe National Park..jpg",
    rating: 4.8
  },
  {
    id: 4,
    title: "Kigali City Tour",
    description: "Explore Rwanda's vibrant capital city with visits to the Genocide Memorial, local markets, and cultural sites. Experience modern Rwanda while learning about its history, culture, and remarkable transformation.",
    price: 75,
    duration: "Half Day",
    groupSize: "1-10 People",
    location: "Kigali City",
    highlights: ["Genocide Memorial visit", "Local market exploration", "Coffee tasting experience", "Cultural center tours"],
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.7
  },
  {
    id: 5,
    title: "Complete Rwanda Experience",
    description: "The ultimate 7-day journey combining all of Rwanda's highlights. From gorilla trekking to Big Five safaris, forest adventures to cultural experiences – see it all with our comprehensive tour package.",
    price: 3500,
    duration: "7 Days",
    groupSize: "2-6 People",
    location: "Multiple Locations",
    highlights: ["All major attractions", "Luxury accommodations", "Private transportation", "Expert guide throughout"],
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.9
  }
]

export function Tours() {
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
              Safari <span className="text-safari-gold italic">Tours</span>
            </h1>
            <p className="text-xl text-safari-sand max-w-3xl mx-auto">
              Choose from our carefully crafted safari experiences, each designed to showcase 
              the best of Rwanda's incredible wildlife and natural beauty.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="safari-section">
        <div className="safari-container">
          <div className="space-y-12">
            {tours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden">
                  <div className={`grid grid-cols-1 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                    <div className={`relative ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                      <img
                        src={tour.image}
                        alt={tour.title}
                        className="w-full h-64 lg:h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-safari-terracotta text-white px-4 py-2 rounded-full font-semibold">
                        ${tour.price}
                      </div>
                    </div>
                    <CardContent className="p-8 flex flex-col justify-center">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(tour.rating)
                                  ? 'text-safari-gold fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {tour.rating} rating
                          </span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-serif font-semibold text-safari-brown mb-4">
                        {tour.title}
                      </h3>

                      <p className="safari-text mb-6">
                        {tour.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-safari-gold" />
                          {tour.duration}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-safari-gold" />
                          {tour.groupSize}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-safari-gold" />
                          {tour.location}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-safari-brown mb-2">Tour Highlights:</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {tour.highlights.map((highlight, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center">
                              <div className="w-1.5 h-1.5 bg-safari-gold rounded-full mr-2 flex-shrink-0" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link to="/book" state={{ selectedTour: tour }}>
                        <Button variant="safari" size="lg" className="w-full sm:w-auto">
                          Book This Tour
                        </Button>
                      </Link>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}