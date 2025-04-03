// supabase/functions/generate_meet_link.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { nanoid } from 'https://esm.sh/nanoid@4.0.2'
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
    // Request body'den rezervasyon bilgisini al
    const { bookingId, studentId, teacherId } = await req.json()

    if (!bookingId || !studentId || !teacherId) {
      throw new Error('Rezervasyon ID, öğrenci ID ve öğretmen ID zorunludur')
    }

    // Supabase client oluştur
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL veya Service Role Key eksik')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Google Meet linki oluştur
    const meetId = nanoid(10) // 10 karakter uzunluğunda unique ID
    
    // Link formatını oluştur: 3-4-3 karakter
    const part1 = meetId.substring(0, 3)
    const part2 = meetId.substring(3, 7)
    const part3 = meetId.substring(7, 10)
    
    const meetLink = `https://meet.google.com/${part1}-${part2}-${part3}`

    // Rezervasyonu güncelle
    const { error } = await supabaseClient
      .from('bookings')
      .update({ meet_link: meetLink })
      .eq('id', bookingId)
      .eq('student_id', studentId)
      .eq('teacher_id', teacherId)

    if (error) throw error

    // Yanıtı döndür
    return new Response(
      JSON.stringify({ 
        success: true, 
        meetLink,
        bookingId
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