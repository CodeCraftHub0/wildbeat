import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, Sun, Moon, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTheme } from "@/hooks/use-theme"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/tours", label: "Tours" },
    { href: "/gallery", label: "Gallery" },
    { href: "/reviews", label: "Reviews" },
    { href: "/support", label: "Support" },
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="safari-container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className={`text-2xl font-serif font-bold ${
              isScrolled ? "text-safari-brown" : "text-safari-cream"
            }`}>
              Wild<span className="text-safari-gold italic">beat</span>
            </span>
          </Link>

          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`font-medium transition-colors ${
                    isScrolled
                      ? isActive(link.href)
                        ? "text-safari-gold"
                        : "text-gray-700 hover:text-safari-gold"
                      : isActive(link.href)
                        ? "text-safari-gold"
                        : "text-safari-cream hover:text-safari-gold"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-safari-cream hover:bg-white/10"
              }`}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className={`text-sm ${
                  isScrolled ? "text-gray-700" : "text-safari-cream"
                }`}>
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className={`p-2 rounded-full transition-colors ${
                    isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-safari-cream hover:bg-white/10"
                  }`}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login">
                  <Button
                    variant={isScrolled ? "outline" : "heroOutline"}
                    size="sm"
                    className={isScrolled ? "border-safari-gold text-safari-brown hover:bg-safari-gold hover:text-safari-cream" : ""}
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant={isScrolled ? "safari" : "hero"}
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            
            <Link to="/book">
              <Button
                variant={isScrolled ? "safari" : "hero"}
                size="sm"
                className="hidden md:inline-flex"
              >
                Book Now
              </Button>
            </Link>

            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 ${
                  isScrolled ? "text-gray-700" : "text-safari-cream"
                }`}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {isMobile && isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <nav className="py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-4 py-2 font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-safari-gold bg-safari-cream dark:bg-gray-700"
                      : "text-gray-700 dark:text-gray-300 hover:text-safari-gold hover:bg-safari-cream dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-4 pt-2 flex items-center space-x-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                
                {user ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
                    <Button onClick={logout} variant="outline" size="sm">
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2 flex-1">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full border-safari-gold text-safari-brown hover:bg-safari-gold hover:text-safari-cream">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                      <Button variant="safari" size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
                
                <Link to="/book" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="safari" size="sm" className="w-full">
                    Book Now
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}