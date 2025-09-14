-- Create tables for the automated compliance checker system

-- Users table for regulatory officers
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'officer' CHECK (role IN ('officer', 'admin')),
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E-commerce platforms being monitored
CREATE TABLE IF NOT EXISTS public.platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  api_endpoint TEXT,
  scraping_config JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product categories for compliance rules
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  compliance_rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products scraped from e-commerce platforms
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID REFERENCES public.platforms(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  weight TEXT,
  dimensions TEXT,
  images JSONB,
  raw_data JSONB,
  url TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance violations detected
CREATE TABLE IF NOT EXISTS public.violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  details JSONB,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  assigned_to UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Compliance reports generated
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('daily', 'weekly', 'monthly', 'custom')),
  generated_by UUID REFERENCES public.users(id),
  date_range_start DATE,
  date_range_end DATE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for platforms (all authenticated users can read)
CREATE POLICY "Authenticated users can view platforms" ON public.platforms
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage platforms" ON public.platforms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for categories (all authenticated users can read)
CREATE POLICY "Authenticated users can view categories" ON public.categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for products (all authenticated users can read)
CREATE POLICY "Authenticated users can view products" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert products" ON public.products
  FOR INSERT WITH CHECK (true);

-- RLS Policies for violations (all authenticated users can read and update)
CREATE POLICY "Authenticated users can view violations" ON public.violations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Officers can update violations" ON public.violations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert violations" ON public.violations
  FOR INSERT WITH CHECK (true);

-- RLS Policies for reports
CREATE POLICY "Users can view all reports" ON public.reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = generated_by);

CREATE POLICY "Users can update their own reports" ON public.reports
  FOR UPDATE USING (auth.uid() = generated_by);
