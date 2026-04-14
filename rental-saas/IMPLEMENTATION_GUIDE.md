# Rental Management SaaS - Implementation Guide

## Phase 1: Database Schema (Run in Supabase SQL Editor)

```sql
-- PROFILES TABLE (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'landlord', 'tenant')) NOT NULL DEFAULT 'tenant',
  landlord_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROPERTIES TABLE
CREATE TABLE public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNITS TABLE
CREATE TABLE public.units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  unit_name TEXT NOT NULL,
  rent_amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('occupied', 'vacant')) DEFAULT 'vacant',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEASES TABLE
CREATE TABLE public.leases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT CHECK (status IN ('active', 'expired')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS TABLE
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_date DATE NOT NULL,
  proof_image_url TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BILLS TABLE (for later)
CREATE TABLE public.bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('unpaid', 'paid')) DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (critical for multi-tenant security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Landlord: see own properties
CREATE POLICY "landlords_see_properties" ON public.properties
  FOR SELECT USING (landlord_id = auth.uid());

-- Tenant: see own payments only
CREATE POLICY "tenants_see_payments" ON public.payments
  FOR SELECT USING (tenant_id = auth.uid());
```

## Phase 2: Project Setup

```bash
npx create-next-app@latest rental-saas --typescript --tailwind --eslint --app --src-dir --no-import-alias
cd rental-saas
npm install @supabase/supabase-js
```

## Folder Structure

```
rental-saas/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ���── landlord/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── properties/page.tsx
│   │   │   └── units/page.tsx
│   │   ├── tenant/
│   │   │   ├── dashboard/page.tsx
│   │   │   └── payments/page.tsx
│   │   ├── api/
│   │   │   └── auth/callback/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/ui/
│   ├── lib/
│   │   ├── supabase/client.ts
│   │   └── types.ts
│   └── middleware.ts
└── package.json
```

## Environment Variables (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Core Features

### Authentication Flow
1. User signs up via Supabase Auth
2. Trigger automatically creates profile in `public.profiles` with selected role
3. Redirect based on role

### Landlord Features
- Create/edit properties
- Create/edit units within properties
- Assign tenants to units (via lease)
- View payment history for all their units

### Tenant Features
- View assigned unit details
- View rent amount and due bills
- Submit payment with proof image
- View payment history

## Security Notes

- Always verify `auth.uid()` matches `tenant_id` or `landlord_id` in queries
- Use Supabase RLS policies for basic protection
- Never trust client-side role checks alone