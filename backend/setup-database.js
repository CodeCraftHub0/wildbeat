const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database
const dbPath = path.join(__dirname, 'wildbeat.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Setting up Wildbeat Safari Database...');

db.serialize(() => {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'guest',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create sessions table
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Create tours table
  db.run(`CREATE TABLE IF NOT EXISTS tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    duration TEXT,
    group_size TEXT,
    location TEXT,
    highlights TEXT,
    image_url TEXT,
    rating REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create bookings table
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tour_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    date TEXT NOT NULL,
    guests INTEGER NOT NULL,
    special_requests TEXT,
    status TEXT DEFAULT 'pending',
    total_price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours (id)
  )`);

  // Create reviews table
  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tour_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    approved INTEGER DEFAULT 0,
    approval_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours (id)
  )`);

  // Create gallery table
  db.run(`CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    image_url TEXT NOT NULL,
    category TEXT,
    alt_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create donation_types table (for admins to customize)
  db.run(`CREATE TABLE IF NOT EXISTS donation_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    icon_color TEXT,
    benefits TEXT,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create donations table
  db.run(`CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donation_type_id INTEGER,
    name TEXT,
    email TEXT,
    amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'stripe',
    transaction_id TEXT UNIQUE,
    status TEXT DEFAULT 'completed',
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_type_id) REFERENCES donation_types (id)
  )`);

  // Insert sample tours
  const tours = [
    ['Akagera National Park Safari', 'Experience Rwanda\'s premier wildlife destination with game drives through savanna landscapes.', 350.00, '2-3 Days', '2-8 People', 'Akagera National Park', 'Big Five wildlife viewing,Boat safari on Lake Ihema,Sunrise game drives,Professional photography opportunities', 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 4.9],
    ['Gorilla Trekking Experience', 'Embark on a life-changing journey to meet mountain gorillas in their natural habitat.', 1500.00, 'Full Day', '1-8 People', 'Volcanoes National Park', 'Mountain gorilla encounters,Expert tracker guides,Conservation education,Certificate of participation', 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 5.0],
    ['Nyungwe Forest Adventure', 'Discover Rwanda\'s ancient rainforest with chimpanzee tracking and canopy walks.', 280.00, '2 Days', '2-6 People', 'Nyungwe National Park', 'Chimpanzee tracking,Canopy walkway experience,Waterfall hikes,Bird watching tours', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 4.8],
    ['Kigali City Tour', 'Explore Rwanda\'s vibrant capital city with cultural and historical sites.', 75.00, 'Half Day', '1-10 People', 'Kigali City', 'Genocide Memorial visit,Local market exploration,Coffee tasting experience,Cultural center tours', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 4.7],
    ['Complete Rwanda Experience', 'The ultimate 7-day journey combining all of Rwanda\'s highlights.', 3500.00, '7 Days', '2-6 People', 'Multiple Locations', 'All major attractions,Luxury accommodations,Private transportation,Expert guide throughout', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 4.9]
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO tours (title, description, price, duration, group_size, location, highlights, image_url, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  tours.forEach(tour => stmt.run(tour));
  stmt.finalize();

  // Insert sample gallery images
  const gallery = [
    ['Elephant Family', 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'wildlife', 'Elephants in Akagera National Park'],
    ['Mountain Gorilla', 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'wildlife', 'Mountain Gorilla'],
    ['Savanna Sunset', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'landscape', 'African Sunset'],
    ['Nyungwe Canopy', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'landscape', 'Nyungwe Forest'],
    ['Safari Adventure', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'adventure', 'Safari Jeep'],
    ['Zebra Crossing', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'wildlife', 'Zebras at waterhole']
  ];

  const galleryStmt = db.prepare('INSERT OR IGNORE INTO gallery (title, image_url, category, alt_text) VALUES (?, ?, ?, ?)');
  gallery.forEach(img => galleryStmt.run(img));
  galleryStmt.finalize();

  // Insert sample reviews
  const reviews = [
    [1, 'Sarah Johnson', 'sarah@example.com', 5, 'Ilyce made our Rwanda safari absolutely magical! Her knowledge of wildlife and passion for conservation made every moment special.'],
    [2, 'Marcus Weber', 'marcus@example.com', 5, 'Professional, knowledgeable, and incredibly friendly. The gorilla trekking was a once-in-a-lifetime experience.'],
    [3, 'Emma Thompson', 'emma@example.com', 5, 'From start to finish, everything was perfectly organized. Best safari experience we\'ve ever had!']
  ];

  const reviewStmt = db.prepare('INSERT OR IGNORE INTO reviews (tour_id, name, email, rating, review_text) VALUES (?, ?, ?, ?, ?)');
  reviews.forEach(review => reviewStmt.run(review));
  reviewStmt.finalize();

  // Insert sample donation types
  const donationTypes = [
    ['Explorer', 25, 'Help provide educational materials for local youth programs', '#D4B896', 'Monthly conservation newsletter,Digital photo collection,Virtual wildlife presentation', 1, 1],
    ['Adventurer', 50, 'Support wildlife conservation and anti-poaching efforts', '#808000', 'Everything in Explorer,10% discount on future tours,Exclusive behind-the-scenes content', 1, 2],
    ['Guardian', 100, 'Fund community tourism training programs', '#D4A574', 'Everything in Adventurer,15% discount on future tours,Personal video message from Ilyce,Priority booking for new tours', 1, 3],
    ['Champion', 250, 'Major contribution to sustainable tourism initiatives', '#8B4513', 'Everything in Guardian,20% discount on future tours,Annual conservation impact report,Invitation to exclusive virtual events', 1, 4]
  ];

  const donationTypeStmt = db.prepare('INSERT OR IGNORE INTO donation_types (title, amount, description, icon_color, benefits, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
  donationTypes.forEach(type => donationTypeStmt.run(type));
  donationTypeStmt.finalize();

  console.log('✅ Database created successfully!');
  console.log('📍 Database location:', dbPath);
  console.log('🎯 Ready to start the server with: npm start');
});

db.close();

