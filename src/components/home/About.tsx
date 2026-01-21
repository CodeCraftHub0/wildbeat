import { Award, Heart, MapPin, Home } from "lucide-react"
import { motion } from "framer-motion"

export function About() {
  const highlights = [
    {
      icon: Award,
      title: "Licensed Guide",
      description: "Certified by Rwanda Tourism Board"
    },
    {
      icon: Heart,
      title: "Passion for Wildlife",
      description: "Dedicated to conservation and education"
    },
    {
      icon: MapPin,
      title: "Local Expertise",
      description: "Born and raised in Rwanda"
    },
    {
      icon: Home,
      title: "Accommodation Help",
      description: "Assistance with lodging arrangements"
    }
  ]

  return (
    <section className="safari-section">
      <div className="safari-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Safari jeep in African landscape"
              className="rounded-lg shadow-xl"
            />
            <div className="absolute -bottom-6 -right-6 bg-safari-gold text-safari-cream p-6 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold">10+</div>
                <div className="text-sm">Years Experience</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <span className="text-safari-gold font-medium text-sm uppercase tracking-wide">
                Meet Wildbeat
              </span>
              <h2 className="safari-subheading text-safari-brown mt-2 mb-4">
                Hi, I'm Ilyce Umuhoza!
              </h2>
            </div>

            <div className="space-y-4 mb-8">
              <p className="safari-text">
                Welcome to my world of adventure! I'm a passionate safari guide based in Kigali, 
                Rwanda, with over 10 years of experience showing travelers the incredible beauty 
                of my homeland.
              </p>
              <p className="safari-text">
                From the Big Five at Akagera National Park to the majestic mountain gorillas 
                in Volcanoes National Park, I'll take you on unforgettable journeys through 
                Rwanda's most spectacular wildlife destinations.
              </p>
              <p className="safari-text">
                My mission is to share Rwanda's natural wonders while supporting local 
                communities and conservation efforts. Every safari is more than just a tour – 
                it's a chance to connect with nature and make a positive impact.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-3 p-4 bg-safari-cream rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <highlight.icon className="w-6 h-6 text-safari-gold" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-safari-brown text-sm">
                      {highlight.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {highlight.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}