import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ThemeProvider } from "@/hooks/use-theme"
import { AuthProvider } from "@/hooks/use-auth"
import { Index } from "@/pages/Index"
import { Tours } from "@/pages/Tours"
import { Gallery } from "@/pages/Gallery"
import { Reviews } from "@/pages/Reviews"
import { Book } from "@/pages/Book"
import { Support } from "@/pages/Support"
import { Login } from "@/pages/Login"
import { Signup } from "@/pages/Signup"
import { NotFound } from "@/pages/NotFound"
import { AdminDonations } from "@/pages/AdminDonations"
import { AdminSupport } from "@/pages/AdminSupport"
import "./App.css"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tours" element={<Tours />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/book" element={<Book />} />
                <Route path="/support" element={<Support />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/admin/donations" element={<AdminDonations />} />
                <Route path="/admin/support" element={<AdminSupport />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
