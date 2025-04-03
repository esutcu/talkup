// supabase/functions/get_teacher_slots.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS için OPTIONS request kontrol
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Request body'den öğretmen ID ve tarih aralığı bilgisini al
    const { teacherId, startDate, endDate } = await req.json()

    if (!teacherId) {
      throw new Error('Öğretmen ID zorunludur')
    }

    // Supabase client oluştur
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL veya Service Role Key eksik')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Sorgu oluşturma
    let query = supabaseClient
      .from('slots')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_available', true)
      .order('date')
      .order('start_time')

    // Eğer tarih aralığı belirtildiyse ekle
    if (startDate) {
      query = query.gte('date', startDate)
    } else {
      // Varsayılan olarak bugünden itibaren göster
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('date', today)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    // Sorguyu çalıştır
    const { data, error } = await query

    if (error) throw error

    // Her gün için müsait saatler
    const slotsByDate = data.reduce((result, slot) => {
      // Her tarih için bir entry oluştur
      if (!result[slot.date]) {
        result[slot.date] = []
      }
      
      // Bu tarihe saati ekle
      result[slot.date].push({
        id: slot.id,
        startTime: slot.start_time,
        endTime: slot.end_time || getNormalizedEndTime(slot.start_time) // Eğer yoksa 1 saat ekle
      })
      
      return result
    }, {})

    // Yanıtı döndür
    return new Response(
      JSON.stringify({ 
        success: true,
        teacher_id: teacherId,
        slots: slotsByDate,
        totalSlots: data.length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
// Başlangıç saatine 1 saat ekler (tüm dersler 1 saatliktir)
function getNormalizedEndTime(startTime: string): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  
  // 1 saat ekle
  let endHour = hours + 1
  
  // 24 saat formatında düzenle
  if (endHour >= 24) {
    endHour = 0
  }
  
  return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}