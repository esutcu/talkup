// User types

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  status: 'active' | 'inactive';
  credits?: number;
  avatar?: string;
  password?: string;
  total_lessons?: number;
  bookings?: { count: number }[];
}

// Booking types
export interface Slot {
  id: string
  teacher_id: string
  date: string
  start_time: string
  is_booked: boolean
}

export interface Booking {
  id: string
  student_id: string
  teacher_id: string
  slot_id: string
  meet_link: string
  status: 'active' | 'completed' | 'cancelled'
}

// Package types
export interface Package {
  id: string
  name: string
  credits: number
  price: number
  is_active: boolean
}