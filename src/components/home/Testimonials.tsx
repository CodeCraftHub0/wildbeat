import { Link } from "react-router-dom"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "United States",
    rating: 5,
    text: "Ilyce made our Rwanda safari absolutely magical! Her knowledge of wildlife and passion for conservation made every moment special. The gorilla trekking was a once-in-a-lifetime experience.",
    tour: "Gorilla Trekking Experience"
  },
  {
    id: 2,
    name: "Marcus Weber",
    location: "Germany",
    rating: 5,
    text: "Professional, knowledgeable, and incredibly friendly. Ilyce showed us parts of Akagera we never would have found on our own. The photography opportunities were endless!",
    tour: "Akagera National Park Safari"
  },
  {
    id: 3,
    name: "Emma Thompson",
    location: "United Kingdom",
    rating: 5,
    text: "From start to finish, everything was perfectly organized. Ilyce's expertise and genuine love for Rwanda's wildlife made this the best safari experience we've ever had.",
    tour: "Complete Rwanda Experience"
  }
]

export function Testimonials() {
  return (
    <section className="safari-section bg-safari-brown">
      <div className="safari-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="safari-subheading text-safari-cream mb-4">
            What Travelers Say
          </h2>
          <p className="text-safari-sand max-w-2xl mx-auto">
            Don't just take our word for it – hear from fellow adventurers who've experienced 
            the magic of Rwanda with Wildbeat Safari Tours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border-safari-gold/20 text-safari-cream h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-safari-gold fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-safari-sand mb-6 italic">
                    "{testimonial.text}"
                  </blockquote>
                  <div className="border-t border-safari-gold/20 pt-4">
                    <div className="font-semibold text-safari-cream">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-safari-sand">
                      {testimonial.location}
                    </div>
                    <div className="text-xs text-safari-gold mt-1">
                      {testimonial.tour}
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
          className="text-center"
        >
          <Link to="/reviews">
            <Button variant="heroOutline" size="lg">
              Read All Reviews
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}