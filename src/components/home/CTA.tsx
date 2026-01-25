import { Link } from "react-router-dom"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/Akagera National Park.jpg')"
        }}
      />
      <div className="safari-gradient-overlay" />
      
      <div className="relative z-10 safari-container text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-2 bg-safari-terracotta/90 rounded-full px-4 py-2 mb-8">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Limited spots for 2024</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Ready for Your <span className="text-safari-gold italic">Adventure?</span>
          </h2>

          <p className="text-xl text-safari-cream/90 mb-8 max-w-2xl mx-auto">
            Don't miss out on the safari experience of a lifetime. Book your Rwanda 
            adventure today and create memories that will last forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book">
              <Button variant="hero" size="lg" className="text-lg px-8 py-3">
                Book Your Safari
              </Button>
            </Link>
            <Link to="/tours">
              <Button variant="heroOutline" size="lg" className="text-lg px-8 py-3">
                Browse Tours
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}