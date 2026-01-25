import { Link } from "react-router-dom"
import { Clock, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

const featuredTours = [
  {
    id: 1,
    title: "Akagera National Park Safari",
    description: "Experience the Big Five in Rwanda's premier wildlife destination with game drives and boat safaris.",
    price: 350,
    duration: "2-3 Days",
    groupSize: "2-8 People",
    location: "Akagera National Park",
    image: "/images/Akagera National Park.jpg"
  },
  {
    id: 2,
    title: "Gorilla Trekking Experience",
    description: "Get up close with mountain gorillas in their natural habitat at Volcanoes National Park.",
    price: 1500,
    duration: "Full Day",
    groupSize: "1-8 People",
    location: "Volcanoes National Park",
    image: "/images/gorilla-trekking.jpeg"
  },
  {
    id: 3,
    title: "Nyungwe Forest Adventure",
    description: "Discover chimpanzees, canopy walks, and stunning waterfalls in Rwanda's ancient rainforest.",
    price: 280,
    duration: "2 Days",
    groupSize: "2-6 People",
    location: "Nyungwe National Park",
    image: "/images/Nyungwe National Park..jpg"
  }
]

export function FeaturedTours() {
  return (
    <section className="safari-section bg-safari-cream">
      <div className="safari-container">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="safari-subheading text-safari-brown mb-4">
              Featured Safari Tours
            </h2>
            <p className="safari-text max-w-2xl mx-auto">
              Discover Rwanda's most spectacular wildlife destinations with our carefully crafted safari experiences.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredTours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-safari-terracotta text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ${tour.price}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-serif font-semibold text-safari-brown mb-2">
                    {tour.title}
                  </h3>
                  <p className="safari-text mb-4 text-sm">
                    {tour.description}
                  </p>
                  <div className="space-y-2 mb-4">
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
                  <Button variant="safari" className="w-full">
                    View Details
                  </Button>
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
          className="text-center"
        >
          <Link to="/tours">
            <Button variant="outline" size="lg" className="border-safari-gold text-safari-brown hover:bg-safari-gold hover:text-safari-cream">
              View All Tours
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}