import { ref } from 'vue'
import { useSupabase } from './useSupabase'
import { useAuthStore } from '@/stores/auth'

export function useGoogleCalendar() {
  const { supabase } = useSupabase()
  const authStore = useAuthStore()
  
  const isAuthorized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastSyncTime = ref(Date.now() - 30 * 60 * 1000) // Son senkronizasyon zamanı (varsayılan 30 dk önce)
  
  // Google Calendar API için gauth client'ı
  const initGoogleAuth = async () => {
    if (window.gapi && window.gapi.auth2) {
      return window.gapi.auth2.getAuthInstance()
    }
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
              clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
              scope: 'https://www.googleapis.com/auth/calendar.events'
            })
            
            const authInstance = window.gapi.auth2.getAuthInstance()
            isAuthorized.value = authInstance.isSignedIn.get()
            
            // Auth değişikliğini dinle
            authInstance.isSignedIn.listen((signedIn) => {
              isAuthorized.value = signedIn
            })
            
            resolve(authInstance)
          } catch (err) {
            reject(err)
          }
        })
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  
  // Google Calendar'a giriş yapma
  const authorize = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const authInstance = await initGoogleAuth()
      
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn()
      }
      
      isAuthorized.value = true
      return true
    } catch (err: any) {
      console.error('Google Calendar authorization error:', err)
      error.value = 'Google Calendar yetkilendirme hatası'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Google Calendar'dan çıkış yapma
  const deauthorize = async () => {
    isLoading.value = true
    
    try {
      const authInstance = await initGoogleAuth()
      
      if (authInstance.isSignedIn.get()) {
        await authInstance.signOut()
      }
      
      isAuthorized.value = false
      return true
    } catch (err: any) {
      console.error('Google Calendar deauthorization error:', err)
      error.value = 'Google Calendar çıkış hatası'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Takvim senkronizasyonu
  const syncCalendar = async () => {
    if (!authStore.userId) {
      error.value = 'Kullanıcı girişi yapılmamış'
      return false
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      if (!isAuthorized.value) {
        await authorize()
      }
      
      // Mevcut dersleri al
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('teacher_id', authStore.userId)
        .gte('start_time', new Date().toISOString())
      
      if (lessonsError) throw lessonsError
      
      // Takvim olayları oluştur ve ekle
      if (lessons && lessons.length > 0) {
        for (const lesson of lessons) {
          // Google Calendar'a ekle
          const startTime = new Date(lesson.start_time)
          const endTime = new Date(startTime)
          endTime.setHours(endTime.getHours() + 1) // 1 saatlik ders
          
          const event = {
            summary: `TalkUp Dersi: ${lesson.student_name}`,
            description: `Öğrenci: ${lesson.student_name}\nMeet Link: ${lesson.meet_link}`,
            start: {
              dateTime: startTime.toISOString(),
              timeZone: 'Europe/Istanbul'
            },
            end: {
              dateTime: endTime.toISOString(),
              timeZone: 'Europe/Istanbul'
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 10 }
              ]
            }
          }
          
          await window.gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: event
          })
        }
      }
      
      // Senkronizasyon zamanını güncelle
      lastSyncTime.value = Date.now()
      
      return true
    } catch (err: any) {
      console.error('Calendar sync error:', err)
      error.value = 'Takvim senkronizasyon hatası'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Müsait saatleri Google Calendar'dan al
  const fetchAvailableSlots = async () => {
    if (!authStore.userId) {
      error.value = 'Kullanıcı girişi yapılmamış'
      return []
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      if (!isAuthorized.value) {
        await authorize()
      }
      
      // Şu andan 2 hafta sonrasına kadar takvimi kontrol et
      const now = new Date()
      const twoWeeksLater = new Date(now)
      twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)
      
      // Google Calendar olaylarını al
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: twoWeeksLater.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      })
      
      const events = response.result.items
      
      // Meşgul saatleri belirle
      const busyTimes = events.map(event => ({
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date)
      }))
      
      // Müsait saatleri belirle (09:00-18:00 arası)
      const availableSlots = []
      const currentDate = new Date(now)
      currentDate.setHours(0, 0, 0, 0)
      
      // 14 gün için kontrol et
      for (let day = 0; day < 14; day++) {
        const checkDate = new Date(currentDate)
        checkDate.setDate(checkDate.getDate() + day)
        
        // Hafta içi mi kontrol et (1-5 = Pazartesi-Cuma)
        const dayOfWeek = checkDate.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) continue
        
        // 9:00 - 18:00 arası her saat
        for (let hour = 9; hour < 18; hour++) {
          const slotStart = new Date(checkDate)
          slotStart.setHours(hour, 0, 0, 0)
          
          const slotEnd = new Date(slotStart)
          slotEnd.setHours(slotEnd.getHours() + 1)
          
          // Geçmiş saatleri atla
          if (slotStart < now) continue
          
          // Bu slot başka bir etkinlikle çakışıyor mu kontrol et
          const isSlotBusy = busyTimes.some(busyTime => 
            (slotStart >= busyTime.start && slotStart < busyTime.end) || 
            (slotEnd > busyTime.start && slotEnd <= busyTime.end) ||
            (slotStart <= busyTime.start && slotEnd >= busyTime.end)
          )
          
          if (!isSlotBusy) {
            availableSlots.push({
              date: slotStart.toISOString().split('T')[0],
              startTime: `${hour.toString().padStart(2, '0')}:00`,
              endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
            })
          }
        }
      }
      
      return availableSlots
    } catch (err: any) {
      console.error('Fetch available slots error:', err)
      error.value = 'Müsait saatler alınamadı'
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    isAuthorized,
    isLoading,
    error,
    lastSyncTime,
    authorize,
    deauthorize,
    syncCalendar,
    fetchAvailableSlots
  }
}