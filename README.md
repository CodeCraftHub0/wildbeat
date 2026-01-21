# Wildbeat Safari Tours

A professional tourism website for Ilyce "Wildbeat" Umuhoza, a safari guide based in Rwanda specializing in Akagera National Park, Nyungwe Forest, Gorilla Trekking, and City Tours.

## Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, safari-themed design with warm earth tones
- **Interactive Components**: Smooth animations with Framer Motion
- **Multi-page Application**: React Router for seamless navigation
- **Booking System**: 3-step booking wizard for tour reservations
- **Photo Gallery**: Filterable image gallery with lightbox
- **Review System**: Customer testimonials and review submission
- **Support Page**: Donation tiers for conservation efforts

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router DOM** for navigation
- **Lucide React** for icons

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Footer
│   ├── home/            # Homepage sections
│   └── ui/              # Reusable UI components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── assets/              # Images and static files
```

## Pages

- **Home** (`/`) - Hero, featured tours, about, testimonials
- **Tours** (`/tours`) - All available safari experiences
- **Gallery** (`/gallery`) - Photo gallery with filters
- **Reviews** (`/reviews`) - Customer testimonials and review form
- **Book** (`/book`) - 3-step booking wizard
- **Support** (`/support`) - Donation page for conservation

## Design System

### Colors
- **Safari Gold**: `hsl(36, 55%, 55%)` - Primary accent color
- **Safari Sand**: `hsl(40, 50%, 75%)` - Light backgrounds
- **Safari Brown**: `hsl(30, 45%, 25%)` - Dark text and backgrounds
- **Safari Olive**: `hsl(55, 50%, 35%)` - Secondary accent
- **Safari Terracotta**: `hsl(18, 85%, 30%)` - Price badges and highlights
- **Safari Cream**: `hsl(40, 35%, 92%)` - Light backgrounds and text

### Typography
- **Headings**: Playfair Display (serif)
- **Body Text**: Inter (sans-serif)

## License

© 2024 Wildbeat Safari Tours. All rights reserved.