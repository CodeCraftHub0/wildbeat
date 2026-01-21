# Backend Setup with Supabase

## Why Supabase?

- **PostgreSQL Database**: Reliable, scalable, and feature-rich
- **Built-in Authentication**: User management out of the box
- **Real-time Features**: Live updates for bookings and reviews
- **Auto-generated APIs**: REST and GraphQL APIs automatically created
- **File Storage**: For tour and gallery images
- **Row Level Security**: Built-in data protection
- **Easy Setup**: No server management required

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Wait for the database to be ready (2-3 minutes)

### 2. Run Database Migration

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the content from `backend/supabase/migrations/001_initial_schema.sql`
4. Run the migration

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Get your project URL and anon key from Supabase dashboard (Settings > API)
3. Update the values in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Database Schema

### Tables Created:

- **tours**: Safari tour information
- **bookings**: Customer booking requests
- **reviews**: Customer reviews (with approval system)
- **gallery**: Photo gallery images
- **donations**: Support donations

### Features:

- **Row Level Security**: Protects sensitive data
- **Public Read Access**: Tours and gallery visible to all
- **Controlled Writes**: Bookings, reviews, donations can be created by anyone
- **Admin Approval**: Reviews require approval before showing

## API Usage

The API functions are in `src/lib/api.ts`:

```typescript
// Get all tours
const tours = await toursApi.getAll()

// Create booking
const booking = await bookingsApi.create({
  tour_id: 1,
  name: "John Doe",
  email: "john@example.com",
  // ... other fields
})

// Get approved reviews
const reviews = await reviewsApi.getApproved()
```

## Next Steps

1. Set up Supabase project
2. Run the migration
3. Configure environment variables
4. Test the API endpoints
5. Optional: Set up Supabase Auth for admin features

## Admin Features (Optional)

You can add admin authentication to:
- Approve/reject reviews
- Manage bookings
- Update tour information
- Upload gallery images

Supabase provides built-in auth with social logins, email/password, and more.