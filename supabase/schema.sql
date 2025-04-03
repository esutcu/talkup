-- Kullanıcılar tablosu
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    credits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Müsait saatler tablosu
CREATE TABLE slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(teacher_id, date, start_time)
);

-- Rezervasyonlar tablosu
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id),
    teacher_id UUID NOT NULL REFERENCES users(id),
    slot_id UUID NOT NULL REFERENCES slots(id),
    meet_link TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rezervasyon oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION create_booking(
    p_student_id UUID,
    p_teacher_id UUID,
    p_slot_id UUID,
    p_meet_link TEXT
) RETURNS UUID AS $$
DECLARE
    v_student_credits INTEGER;
    v_booking_id UUID;
BEGIN
    -- Kredileri kontrol et
    SELECT credits INTO v_student_credits
    FROM users
    WHERE id = p_student_id FOR UPDATE;
    
    IF v_student_credits < 1 THEN
        RAISE EXCEPTION 'Yetersiz kredi';
    END IF;
    
    -- Slot'u kilitle
    UPDATE slots
    SET is_booked = TRUE
    WHERE id = p_slot_id AND is_booked = FALSE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Slot müsait değil';
    END IF;
    
    -- Booking oluştur
    INSERT INTO bookings (
        student_id,
        teacher_id,
        slot_id,
        meet_link
    ) VALUES (
        p_student_id,
        p_teacher_id,
        p_slot_id,
        p_meet_link
    ) RETURNING id INTO v_booking_id;
    
    -- Krediyi düş
    UPDATE users
    SET credits = credits - 1
    WHERE id = p_student_id;
    
    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;