import { Hero } from "@/components/home/Hero"
import { FeaturedTours } from "@/components/home/FeaturedTours"
import { About } from "@/components/home/About"
import { Testimonials } from "@/components/home/Testimonials"
import { CTA } from "@/components/home/CTA"

export function Index() {
  return (
    <div>
      <Hero />
      <FeaturedTours />
      <About />
      <Testimonials />
      <CTA />
    </div>
  )
}