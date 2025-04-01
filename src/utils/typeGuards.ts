/**
 * TypeScript type guard fonksiyonları
 * Bu fonksiyonlar, çalışma zamanında tip kontrolü yapmak için kullanılır
 */

import type { Teacher, Student } from '@/types/User'
import type { BookingStatus } from '@/types/Booking'

/**
 * Bir değerin null olmadığını kontrol eder
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null
}

/**
 * Bir değerin undefined olmadığını kontrol eder
 */
export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

/**
 * Bir değerin null veya undefined olmadığını kontrol eder
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Bir dize değerin boş olmadığını kontrol eder
 */
export function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Bir nesnenin veya dizenin boş olup olmadığını kontrol eder
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Bir nesnenin verilen bir özelliğe sahip olup olmadığını kontrol eder
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

/**
 * Bir değerin öğretmen olup olmadığını kontrol eder
 */
export function isTeacher(user: any): user is Teacher {
  return isDefined(user) && user.role === 'teacher'
}

/**
 * Bir değerin öğrenci olup olmadığını kontrol eder
 */
export function isStudent(user: any): user is Student {
  return isDefined(user) && user.role === 'student'
}

/**
 * Bir değerin geçerli bir BookingStatus olup olmadığını kontrol eder
 */
export function isValidBookingStatus(status: string): status is BookingStatus {
  return ['active', 'completed', 'cancelled'].includes(status)
}

/**
 * Bir değerin geçerli bir tarih olup olmadığını kontrol eder
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Bir değerin geçerli bir tarih dizesi olup olmadığını kontrol eder
 */
export function isValidDateString(dateStr: string): boolean {
  if (!isNonEmptyString(dateStr)) return false
  
  // ISO tarih formatı veya YYYY-MM-DD formatı
  const pattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/
  if (!pattern.test(dateStr)) return false
  
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

/**
 * Bir değerin geçerli bir saat dizesi olup olmadığını kontrol eder
 */
export function isValidTimeString(timeStr: string): boolean {
  if (!isNonEmptyString(timeStr)) return false
  
  // HH:MM formatı
  const pattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return pattern.test(timeStr)
}

/**
 * Bir değerin geçerli bir e-posta adresi olup olmadığını kontrol eder
 */
export function isValidEmail(email: string): boolean {
  if (!isNonEmptyString(email)) return false
  
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return pattern.test(email)
}

/**
 * Bir değerin sayı olup olmadığını kontrol eder
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * Bir değerin pozitif sayı olup olmadığını kontrol eder
 */
export function isPositiveNumber(value: any): value is number {
  return isNumber(value) && value > 0
}

/**
 * Bir değerin dizi olup olmadığını kontrol eder
 */
export function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value)
}

/**
 * Bir değerin fonksiyon olup olmadığını kontrol eder
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}