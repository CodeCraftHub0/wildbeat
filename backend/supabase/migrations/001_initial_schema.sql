-- Create tours table
CREATE TABLE tours (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration VARCHAR(100),
  group_size VARCHAR(100),
  location VARCHAR(255),
  highlights TEXT[],
  image_url VARCHAR(500),
  rating DECIMAL(2,1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  tour_id INTEGER REFERENCES tours(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  date DATE NOT NULL,
  guests INTEGER NOT NULL,
  special_requests TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  total_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  tour_id INTEGER REFERENCES tours(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create gallery table
CREATE TABLE gallery (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  category VARCHAR(100),
  alt_text VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create donations table
CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  tier VARCHAR(100),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample tours
INSERT INTO tours (title, description, price, duration, group_size, location, highlights, image_url, rating) VALUES
('Akagera National Park Safari', 'Experience Rwanda''s premier wildlife destination with game drives through savanna landscapes.', 350.00, '2-3 Days', '2-8 People', 'Akagera National Park', ARRAY['Big Five wildlife viewing', 'Boat safari on Lake Ihema', 'Sunrise game drives', 'Professional photography opportunities'], 'https://images.unsplash.com/photo-1551632811-561732d1e306', 4.9),
('Gorilla Trekking Experience', 'Embark on a life-changing journey to meet mountain gorillas in their natural habitat.', 1500.00, 'Full Day', '1-8 People', 'Volcanoes National Park', ARRAY['Mountain gorilla encounters', 'Expert tracker guides', 'Conservation education', 'Certificate of participation'], 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44', 5.0),
('Nyungwe Forest Adventure', 'Discover Rwanda''s ancient rainforest with chimpanzee tracking and canopy walks.', 280.00, '2 Days', '2-6 People', 'Nyungwe National Park', ARRAY['Chimpanzee tracking', 'Canopy walkway experience', 'Waterfall hikes', 'Bird watching tours'], 'https://images.unsplash.com/photo-1544735716-392fe2489ffa', 4.8),
('Kigali City Tour', 'Explore Rwanda''s vibrant capital city with cultural and historical sites.', 75.00, 'Half Day', '1-10 People', 'Kigali City', ARRAY['Genocide Memorial visit', 'Local market exploration', 'Coffee tasting experience', 'Cultural center tours'], 'https://images.unsplash.com/photo-1578662996442-48f60103fc96', 4.7),
('Complete Rwanda Experience', 'The ultimate 7-day journey combining all of Rwanda''s highlights.', 3500.00, '7 Days', '2-6 People', 'Multiple Locations', ARRAY['All major attractions', 'Luxury accommodations', 'Private transportation', 'Expert guide throughout'], 'https://images.unsplash.com/photo-1516426122078-c23e76319801', 4.9);

-- Insert sample gallery images
INSERT INTO gallery (title, image_url, category, alt_text) VALUES
('Elephant Family', 'https://images.unsplash.com/photo-1551632811-561732d1e306', 'wildlife', 'Elephants in Akagera National Park'),
('Mountain Gorilla', 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44', 'wildlife', 'Mountain Gorilla'),
('Savanna Sunset', 'https://images.unsplash.com/photo-1516426122078-c23e76319801', 'landscape', 'African Sunset'),
('Nyungwe Canopy', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa', 'landscape', 'Nyungwe Forest'),
('Safari Adventure', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e', 'adventure', 'Safari Jeep'),
('Zebra Crossing', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0', 'wildlife', 'Zebras at waterhole');

-- Enable Row Level Security
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Tours are viewable by everyone" ON tours FOR SELECT USING (true);
CREATE POLICY "Gallery is viewable by everyone" ON gallery FOR SELECT USING (true);
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews FOR SELECT USING (approved = true);

-- Create policies for inserts (bookings, reviews, donations)
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create donations" ON donations FOR INSERT WITH CHECK (true);