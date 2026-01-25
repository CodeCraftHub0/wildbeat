import { Link } from "react-router-dom"
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-safari-brown text-safari-cream">
      <div className="safari-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-serif font-bold">
                Wild<span className="text-safari-gold italic">beat</span>
              </span>
            </Link>
            <p className="text-safari-sand mb-4">
              Your trusted guide to Rwanda's incredible wildlife and natural beauty.
            </p>
            <p className="text-sm text-safari-sand">
              Licensed • Experienced • Passionate
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tours" className="text-safari-sand hover:text-safari-gold transition-colors">
                  Safari Tours
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-safari-sand hover:text-safari-gold transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-safari-sand hover:text-safari-gold transition-colors">
                  Reviews
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-safari-sand hover:text-safari-gold transition-colors">
                  Book Now
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-safari-sand hover:text-safari-gold transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-safari-gold" />
                <span className="text-safari-sand">+250 788 123 456</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-safari-gold" />
                <span className="text-safari-sand">hello@wildbeatsafari.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin size={16} className="text-safari-gold" />
                <span className="text-safari-sand">Kigali, Rwanda</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="#"
                className="p-2 bg-safari-gold/20 rounded-full hover:bg-safari-gold/30 transition-colors"
              >
                <Instagram size={20} className="text-safari-gold" />
              </a>
              <a
                href="#"
                className="p-2 bg-safari-gold/20 rounded-full hover:bg-safari-gold/30 transition-colors"
              >
                <Facebook size={20} className="text-safari-gold" />
              </a>
            </div>
            <p className="text-sm text-safari-sand">
              Share your safari memories with #WildbeatSafari
            </p>
          </div>
        </div>

        <div className="border-t border-safari-gold/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-safari-sand text-sm">
            © 2024 Wildbeat Safari Tours. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-safari-sand hover:text-safari-gold text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-safari-sand hover:text-safari-gold text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}