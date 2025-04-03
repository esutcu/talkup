-- supabase/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY, -- Supabase Auth ile ilişkilendirme için
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    surname TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    avatar TEXT,
    credits INTEGER,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Paketler tablosu
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    credit_amount INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Öğretmen müsait saatleri tablosu
CREATE TABLE IF NOT EXISTS public.slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    booking_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(teacher_id, date, start_time) -- Aynı öğretmen aynı tarih ve saatte sadece bir slot olabilir
);

-- Ders rezervasyonları tablosu
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    meet_link TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Kredi işlemleri tablosu
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    package_id UUID REFERENCES public.packages(id),
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'use', 'refund')),
    description TEXT,
    price DECIMAL(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ödeme işlemleri tablosu
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TRY',
    conversation_id TEXT,
    payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'init_failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Bildirimler tablosu
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kullanıcı ayarları tablosu
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    calendar_auto_sync BOOLEAN NOT NULL DEFAULT FALSE,
    calendar_sync_frequency TEXT NOT NULL DEFAULT '24',
    calendar_two_way_sync BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(user_id)
);

-- Senkronizasyon logları tablosu
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed'))
);

-- Müsait bir slotu kontrol edip kilitleyen fonksiyon
CREATE OR REPLACE FUNCTION check_and_lock_slot(
  p_teacher_id UUID,
  p_date DATE,
  p_start_time TIME
)
RETURNS SETOF slots
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE slots
  SET is_available = false, updated_at = NOW()
  WHERE teacher_id = p_teacher_id 
    AND date = p_date 
    AND start_time = p_start_time
    AND is_available = true
    AND booking_id IS NULL
  RETURNING *;
END;
$$;

-- Rezervasyon oluşturan ve kredi düşen transaction
CREATE OR REPLACE FUNCTION create_booking_transaction(
  p_booking_id UUID,
  p_student_id UUID,
  p_teacher_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_slot_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_end_time TIME;
  v_result JSON;
BEGIN
  -- End time hesapla (1 saat ekliyoruz)
  SELECT (p_start_time::time + interval '1 hour')::time INTO v_end_time;
  
  -- Transaction başlat
  BEGIN
    -- 1. Krediyi düş
    UPDATE users
    SET credits = credits - 1,
        updated_at = NOW()
    WHERE id = p_student_id AND credits >= 1;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Yetersiz kredi';
    END IF;
    
    -- 2. Rezervasyon oluştur
    INSERT INTO bookings (
      id,
      student_id,
      teacher_id,
      date,
      start_time,
      end_time,
      status,
      created_at
    )
    VALUES (
      p_booking_id,
      p_student_id,
      p_teacher_id,
      p_date,
      p_start_time,
      v_end_time,
      'active',
      NOW()
    );
    
    -- 3. Slot'u güncelle
    UPDATE slots
    SET booking_id = p_booking_id,
        is_available = false,
        updated_at = NOW()
    WHERE id = p_slot_id;
    
    -- 4. Kredi işlem kaydı oluştur
    INSERT INTO credit_transactions (
      user_id,
      amount,
      type,
      description,
      created_at
    )
    VALUES (
      p_student_id,
      -1,
      'use',
      'Ders rezervasyonu',
      NOW()
    );
    
    -- Sonuç oluştur
    SELECT json_build_object(
      'success', true,
      'booking_id', p_booking_id
    ) INTO v_result;
    
    RETURN v_result;
  EXCEPTION
    WHEN OTHERS THEN
      -- Hata durumunda rollback yapılır
      RAISE;
  END;
END;
$$;

-- Indeksler
CREATE INDEX IF NOT EXISTS idx_slots_teacher_date ON public.slots(teacher_id, date);
CREATE INDEX IF NOT EXISTS idx_slots_availability ON public.slots(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON public.bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_teacher ON public.bookings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

-- RLS (Row Level Security) kuralları

-- Users tablosu için RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcılar tüm users kayıtlarına erişebilir
CREATE POLICY "Admins can do anything" ON public.users 
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Kullanıcılar kendi bilgilerini okuyabilir ve güncelleyebilir
CREATE POLICY "Users can view and update their own data" ON public.users 
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

-- Herkes öğretmenlerin bilgilerini görebilir (güvenli alanlar)
CREATE POLICY "Everyone can see teachers" ON public.users 
  FOR SELECT
  TO authenticated
  USING (role = 'teacher' AND status = 'active');

-- Slots tablosu için RLS
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

-- Öğretmenler kendi slotlarını yönetebilir
CREATE POLICY "Teachers can manage their own slots" ON public.slots 
  FOR ALL
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Herkes müsait slotları görebilir
CREATE POLICY "Everyone can see available slots" ON public.slots 
  FOR SELECT
  TO authenticated
  USING (is_available = true);

-- Bookings tablosu için RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Öğrenciler kendi rezervasyonlarını görebilir
CREATE POLICY "Students can see their own bookings" ON public.bookings 
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Öğretmenler kendi derslerini görebilir
CREATE POLICY "Teachers can see their own lessons" ON public.bookings 
  FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Öğrenciler rezervasyon yapabilir
CREATE POLICY "Students can create bookings" ON public.bookings 
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Öğrenciler kendi rezervasyonlarını iptal edebilir
CREATE POLICY "Students can cancel their bookings" ON public.bookings 
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (status = 'cancelled');

-- Packages tablosu için RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Adminler paketleri yönetebilir
CREATE POLICY "Admins can manage packages" ON public.packages 
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Herkes aktif paketleri görebilir
CREATE POLICY "Everyone can see active packages" ON public.packages 
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Credit transactions tablosu için RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi kredi işlemlerini görebilir
CREATE POLICY "Users can see their own credit transactions" ON public.credit_transactions 
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Payment transactions tablosu için RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi ödeme işlemlerini görebilir
CREATE POLICY "Users can see their own payment transactions" ON public.payment_transactions 
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Notifications tablosu için RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi bildirimlerini görebilir ve güncelleyebilir
CREATE POLICY "Users can manage their own notifications" ON public.notifications 
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- User settings tablosu için RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi ayarlarını yönetebilir
CREATE POLICY "Users can manage their own settings" ON public.user_settings 
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Sync logs tablosu için RLS
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi senkronizasyon loglarını görebilir
CREATE POLICY "Users can see their own sync logs" ON public.sync_logs 
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);