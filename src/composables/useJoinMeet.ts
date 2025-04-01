import { ref } from 'vue'

export function useJoinMeet() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Google Meet'e katılma fonksiyonu
  const joinMeeting = async (meetLink: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Google Meet link formatı kontrolü
      if (!meetLink || !meetLink.includes('meet.google.com')) {
        throw new Error('Geçersiz Google Meet linki')
      }
      
      // Yeni pencerede aç
      window.open(meetLink, '_blank')
      
      return true
    } catch (err: any) {
      console.error('Join meeting error:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Google Meet linki oluşturma fonksiyonu (normalde backend'de yapılır)
  const createMeetLink = (lessonId: string) => {
    // Gerçek uygulamada bu backend tarafında yapılmalı
    // Burada sadece sahte bir link oluşturuyoruz
    return `https://meet.google.com/talkup-${lessonId.substring(0, 8)}`
  }
  
  return {
    isLoading,
    error,
    joinMeeting,
    createMeetLink
  }
}