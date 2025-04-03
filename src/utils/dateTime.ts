// Tarih ve saat formatları için yardımcı fonksiyonlar
export const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export const formatTime = (timeString: string | undefined): string => {
  if (!timeString) return ''
  
  if (timeString.includes(':') && !timeString.includes('T')) {
    return timeString
  }
  
  const date = new Date(timeString)
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const formatDateTime = (dateTimeString: string | Date | undefined): string => {
  if (!dateTimeString) return ''
  
  const date = new Date(dateTimeString)
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const formatPrice = (price: number | undefined): string => {
  if (price === undefined) return ''
  
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}