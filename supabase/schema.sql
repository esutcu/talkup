-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Kullanıcılar tablosu
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    credits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Müsait saatler tablosu
CREATE TABLE public.slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(teacher_id, date, start_time)
);

-- Rezervasyonlar tablosu
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    meet_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kredi paketleri tablosu
CREATE TABLE public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kredi işlemleri tablosu
CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    package_id UUID REFERENCES public.packages(id),
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'use', 'refund')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Temel indeksler
CREATE INDEX idx_slots_teacher_date ON slots(teacher_id, date);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_teacher ON bookings(teacher_id);

-- Basit RLS kuralları
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can see own data" ON public.users 
    FOR SELECT TO authenticated 
    USING (auth.uid() = id);

CREATE POLICY "Teachers can manage their slots" ON public.slots 
    FOR ALL TO authenticated 
    USING (auth.uid() = teacher_id);

CREATE POLICY "Users can see available slots" ON public.slots 
    FOR SELECT TO authenticated 
    USING (NOT is_booked);

CREATE POLICY "Students see own bookings" ON public.bookings 
    FOR SELECT TO authenticated 
    USING (auth.uid() = student_id OR auth.uid() = teacher_id);

CREATE POLICY "Everyone can see active packages" ON public.packages 
    FOR SELECT TO authenticated 
    USING (is_active = true);

CREATE POLICY "Users see own transactions" ON public.credit_transactions 
    FOR SELECT TO authenticated 
    USING (auth.uid() = user_id);