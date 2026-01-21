import { Link } from "react-router-dom"
import { Star, ChevronDown, Users, Calendar, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
        }}
      />
      <div className="safari-gradient-overlay" />
      
      <div className="relative z-10 safari-container text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-safari-gold" />
            <span className="text-sm font-medium">Your Trusted Guide in Rwanda</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="safari-heading mb-6"
        >
          Discover Rwanda's{" "}
          <span className="text-safari-gold italic">Wild Beauty</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-safari-cream/90 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Join Ilyce "Wildbeat" Umuhoza on unforgettable safari adventures through 
          Akagera National Park, Nyungwe Forest, and beyond. Experience Rwanda's 
          incredible wildlife with a passionate local guide.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link to="/tours">
            <Button variant="hero" size="lg" className="text-lg px-8 py-3">
              Explore Tours
            </Button>
          </Link>
          <Link to="/gallery">
            <Button variant="heroOutline" size="lg" className="text-lg px-8 py-3">
              View Gallery
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-safari-gold mr-2" />
              <span className="text-2xl font-bold">500+</span>
            </div>
            <p className="text-safari-cream/80">Happy Travelers</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-safari-gold mr-2" />
              <span className="text-2xl font-bold">10+</span>
            </div>
            <p className="text-safari-cream/80">Years Experience</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-6 h-6 text-safari-gold mr-2" />
              <span className="text-2xl font-bold">4.9</span>
            </div>
            <p className="text-safari-cream/80">Average Rating</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-8 border-2 border-safari-cream rounded-full flex items-center justify-center cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <ChevronDown className="w-4 h-4 text-safari-cream" />
        </motion.div>
      </motion.div>
    </section>
  )
}