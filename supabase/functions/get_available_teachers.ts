// supabase/functions/get_available_teachers.ts
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
    // Request body'den tarih ve saat bilgisini al
    const { date, time } = await req.json()

    if (!date || !time) {
      throw new Error('Tarih ve saat zorunludur')
    }

    // Supabase client oluştur
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Belirtilen tarih ve saatte müsait öğretmenleri bul
    const { data, error } = await supabaseClient
      .from('slots')
      .select(`
        teacher:teacher_id (
          id,
          name,
          email,
          surname,
          avatar,
          bio
        )
      `)
      .eq('date', date)
      .eq('start_time', time)
      .eq('is_available', true)
      .neq('booking_id', null) // Herhangi bir rezervasyon yapılmamış slotlar

    if (error) throw error

    // Müsait öğretmenleri bir array'e dönüştür (duplicate'leri kaldır)
    const availableTeachers = data.reduce((teachers, slot) => {
      const teacherId = slot.teacher.id
      // Eğer bu öğretmen zaten eklenmediyse, ekle
      if (!teachers.some(t => t.id === teacherId)) {
        teachers.push(slot.teacher)
      }
      return teachers
    }, [])

    // Yanıtı döndür
    return new Response(
      JSON.stringify({ 
        success: true, 
        teachers: availableTeachers,
        count: availableTeachers.length
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