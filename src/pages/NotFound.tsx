import { Link } from "react-router-dom"
import { Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-safari-cream">
      <div className="text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-8xl font-bold text-safari-gold mb-4">404</div>
          <h1 className="text-4xl font-serif font-bold text-safari-brown mb-4">
            Oops! You've wandered off the safari trail
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The page you're looking for seems to have migrated to a different location. 
            Let's get you back on track to discover Rwanda's amazing wildlife!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="safari" size="lg" className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => window.history.back()}
              className="flex items-center border-safari-gold text-safari-brown hover:bg-safari-gold hover:text-safari-cream"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="mt-12">
            <img
              src="/images/Akagera National Park.jpg"
              alt="Elephant in the wild"
              className="mx-auto rounded-lg shadow-lg max-w-md"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}