import { useState } from "react"
import { Camera, Upload, X, Sparkles, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { galleryApi } from "@/lib/api-local"

const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Elephants in Akagera National Park",
    category: "wildlife",
    title: "Elephant Family"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Mountain Gorilla",
    category: "wildlife",
    title: "Mountain Gorilla"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "African Sunset",
    category: "landscape",
    title: "Savanna Sunset"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Nyungwe Forest",
    category: "landscape",
    title: "Nyungwe Canopy"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Safari Jeep",
    category: "adventure",
    title: "Safari Adventure"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Zebras at waterhole",
    category: "wildlife",
    title: "Zebra Crossing"
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Kigali cityscape",
    category: "landscape",
    title: "Kigali Hills"
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    alt: "Lion pride",
    category: "wildlife",
    title: "Lion Pride"
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    alt: "Trekking adventure",
    category: "adventure",
    title: "Forest Trek"
  }
]

const categories = [
  { id: "all", label: "All Photos" },
  { id: "wildlife", label: "Wildlife" },
  { id: "landscape", label: "Landscape" },
  { id: "adventure", label: "Adventure" }
]

export function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadData, setUploadData] = useState({ title: "", category: "wildlife", file: null as File | null })
  const [dragOver, setDragOver] = useState(false)

  const filteredImages = selectedCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadData.file) return
    
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        await galleryApi.create({
          title: uploadData.title,
          image_url: reader.result as string,
          category: uploadData.category,
          alt_text: uploadData.title
        })
        alert('Photo uploaded successfully!')
        setShowUpload(false)
        setUploadData({ title: "", category: "wildlife", file: null })
      }
      reader.readAsDataURL(uploadData.file)
    } catch (error) {
      alert('Upload failed. Please try again.')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files[0]) {
      setUploadData({...uploadData, file: files[0]})
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  return (
    <div className="pt-16">
      <section className="relative py-24 bg-safari-brown">
        <div className="safari-container text-center text-safari-cream">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="safari-heading mb-6">
              Safari <span className="text-safari-gold italic">Gallery</span>
            </h1>
            <p className="text-xl text-safari-sand max-w-3xl mx-auto">
              Explore stunning photographs from our safari adventures across Rwanda. 
              Each image tells a story of wildlife encounters and natural beauty.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="safari-section">
        <div className="safari-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "safari" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="border-safari-gold text-safari-brown hover:bg-safari-gold hover:text-safari-cream"
              >
                {category.label}
              </Button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative group cursor-pointer overflow-hidden rounded-lg ${
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    index === 0 ? 'h-96 md:h-full' : 'h-64'
                  }`}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="font-semibold">{image.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center bg-safari-cream rounded-lg p-8"
          >
            <Upload className="w-12 h-12 text-safari-gold mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-semibold text-safari-brown mb-4">
              Share Your Safari Memories
            </h3>
            <p className="safari-text mb-6 max-w-2xl mx-auto">
              Been on a safari with us? We'd love to feature your photos in our gallery! 
              Share your amazing wildlife encounters and adventure moments.
            </p>
            <Button variant="safari" size="lg" onClick={() => setShowUpload(true)}>
              Upload Photos
            </Button>
          </motion.div>
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-xl font-semibold">{selectedImage.title}</h3>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-safari-cream rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <button 
                onClick={() => setShowUpload(false)}
                className="absolute top-4 right-4 p-2 hover:bg-safari-sand rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-safari-brown" />
              </button>
              
              <div className="w-16 h-16 bg-safari-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-safari-cream" />
              </div>
              
              <h3 className="text-2xl font-serif font-bold text-safari-brown mb-2">Upload Photo</h3>
              <p className="text-safari-brown/70">Share your captured safari moments with the world</p>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-safari-brown mb-2">Photo Title</label>
                <Input
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  placeholder="Enter a title for your photo"
                  className="border-safari-sand focus:border-safari-gold bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-safari-brown mb-2">Category</label>
                <div className="relative">
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                    className="w-full h-12 px-4 py-2 border border-safari-sand bg-white rounded-lg text-sm focus:border-safari-gold focus:outline-none appearance-none"
                  >
                    <option value="wildlife">🦁 Wildlife</option>
                    <option value="landscape">🌄 Landscape</option>
                    <option value="adventure">🚙 Adventure</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-safari-brown mb-2">Select Photo</label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragOver ? 'border-safari-gold bg-safari-gold/10' : 'border-safari-sand hover:border-safari-gold'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="w-12 h-12 bg-safari-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowUp className="w-6 h-6 text-safari-gold" />
                  </div>
                  <p className="font-semibold text-safari-brown mb-1">Drop your photo here</p>
                  <p className="text-sm text-safari-brown/60 mb-4">or click to browse</p>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setUploadData({...uploadData, file: e.target.files?.[0] || null})}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadData.file && (
                    <p className="text-sm text-safari-gold font-medium">{uploadData.file.name}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  onClick={() => setShowUpload(false)} 
                  variant="outline"
                  className="flex-1 border-2 border-safari-sand text-safari-brown hover:bg-safari-sand hover:text-safari-brown"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="safari" 
                  className="flex-1 bg-safari-gold hover:bg-safari-gold/90 text-safari-cream font-semibold"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}