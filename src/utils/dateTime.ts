/**
 * Tarih ve saat işlemleri için yardımcı fonksiyonlar
 */

// Tarih formatını lokale uygun şekilde döndürür (örn: 15 Mayıs 2023)
export const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }
  
  // Saat formatını döndürür (örn: 14:30)
  export const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return ''
    
    // Eğer sadece saat:dakika şeklindeyse
    if (timeString.includes(':') && !timeString.includes('T')) {
      return timeString
    }
    
    // ISO String veya tarih içeren string ise
    const date = new Date(timeString)
    
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  // Tarih ve saati birlikte formatlar (örn: 15 Mayıs 2023, 14:30)
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
  
  // Kısa tarih formatı (örn: 15.05.2023)
  export const formatShortDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }
  
  // Ay ve yıl formatı (örn: Mayıs 2023)
  export const formatMonth = (dateString: string | Date | undefined): string => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    
    return new Intl.DateTimeFormat('tr-TR', {
      month: 'long',
      year: 'numeric'
    }).format(date)
  }
  
  // Haftanın günü (örn: Pazartesi)
  export const formatWeekday = (dateString: string | Date | undefined): string => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    
    return new Intl.DateTimeFormat('tr-TR', {
      weekday: 'long'
    }).format(date)
  }
  
  // Ne kadar zaman önce/sonra formatı (örn: 5 dakika önce, 2 saat sonra)
  export const formatTimeAgo = (dateString: string | Date | undefined): string => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    
    const seconds = Math.floor(diffInMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `${days} gün önce`
    }
    
    if (hours > 0) {
      return `${hours} saat önce`
    }
    
    if (minutes > 0) {
      return `${minutes} dakika önce`
    }
    
    return 'Az önce'
  }
  
  // Para formatı (örn: 1.250,00 ₺)
  export const formatPrice = (price: number | undefined): string => {
    if (price === undefined) return ''
    
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }
  
  // İki tarih arasındaki farkı saat:dakika şeklinde formatlar
  export const formatDuration = (startDate: Date, endDate: Date): string => {
    const diffInMs = endDate.getTime() - startDate.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    
    const hours = Math.floor(diffInMinutes / 60)
    const minutes = diffInMinutes % 60
    
    if (hours > 0) {
      return `${hours} saat ${minutes > 0 ? `${minutes} dakika` : ''}`
    }
    
    return `${minutes} dakika`
  }
  
  // Tarih aralığını formatlar (örn: 15-20 Mayıs 2023)
  export const formatDateRange = (startDate: Date, endDate: Date): string => {
    const isSameMonth = startDate.getMonth() === endDate.getMonth()
    const isSameYear = startDate.getFullYear() === endDate.getFullYear()
    
    if (isSameMonth && isSameYear) {
      // Aynı ay ve yıl ise (örn: 15-20 Mayıs 2023)
      const startDay = startDate.getDate()
      
      return `${startDay}-${formatDate(endDate)}`
    }
    
    if (isSameYear) {
      // Sadece aynı yıl ise (örn: 15 Nisan - 20 Mayıs 2023)
      const startFormatter = new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long'
      })
      
      return `${startFormatter.format(startDate)} - ${formatDate(endDate)}`
    }
    
    // Farklı yıllar ise tam format (örn: 15 Mayıs 2022 - 20 Nisan 2023)
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }
  
  // Saat aralığını formatlar (örn: 14:30 - 15:30)
  export const formatTimeRange = (startTime: string, endTime: string): string => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  }