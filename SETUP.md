# Asami Haven - Spa Booking Website

A modern, responsive spa booking website built with Next.js, Tailwind CSS, and Supabase.

## Features

- **Dark Theme**: Elegant, aesthetic design with gold/bronze accents
- **Responsive**: Works on all devices (mobile, tablet, desktop)
- **Booking System**: Online appointment booking with validation
- **Admin Dashboard**: Secure admin panel to manage bookings
- **Supabase Integration**: PostgreSQL database with authentication

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, REST API)
- **Hosting**: Vercel
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Vercel account (free tier)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API and copy your:
   - Project URL
   - Anon/Public Key

### 3. Create Database Schema

Go to Supabase SQL Editor and run the following SQL:

```sql
-- Create ENUM types
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');

-- Create services table
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id UUID REFERENCES services(id),
  service_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status booking_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "public_insert_booking" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "public_view_services" ON services FOR SELECT USING (is_active = true);

-- Admin policy (replace with your admin email)
CREATE POLICY "admin_full_access_bookings" ON bookings FOR ALL 
  USING (auth.jwt() ->> 'email' = 'your-admin-email@example.com');

CREATE POLICY "admin_full_access_services" ON services FOR ALL 
  USING (auth.jwt() ->> 'email' = 'your-admin-email@example.com');

-- Insert sample services
INSERT INTO services (name, description, price, duration) VALUES
  ('Swedish Massage', 'Relaxing full-body massage', 80, 60),
  ('Deep Tissue Massage', 'Therapeutic massage for muscle tension', 100, 60),
  ('Hot Stone Massage', 'Massage with heated stones', 120, 90),
  ('Aromatherapy Massage', 'Massage with essential oils', 90, 60),
  ('Sports Massage', 'Focused massage for athletes', 110, 60),
  ('Prenatal Massage', 'Gentle massage for expectant mothers', 95, 60);
```

### 4. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Create Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" and create an admin account with your email
3. Use this email/password to log in to `/admin/login`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (public)/           # Public pages
│   │   ├── page.tsx        # Home
│   │   ├── services/       # Services page
│   │   ├── booking/        # Booking page
│   │   └── contact/        # Contact page
│   ├── (admin)/            # Admin pages
│   │   └── admin/
│   │       ├── page.tsx    # Dashboard
│   │       └── login/      # Login page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components
│   └── booking/            # Booking components
└── lib/
    └── supabase/
        └── client.ts       # Supabase client
```

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel settings
4. Deploy!

## Admin Dashboard

Access the admin dashboard at `/admin`:
- View all bookings
- Filter by status
- Update booking status (pending → confirmed → completed)
- View customer information

## Customization

### Theme Colors

Edit `src/app/globals.css` to customize colors:

```css
:root {
  --background: #0a0a0a;
  --primary: #d4a574;
  --primary-hover: #c49564;
  /* ... other colors */
}
```

### Services

Update services in the database or modify the sample data in `src/app/(public)/services/page.tsx`

## License

MIT