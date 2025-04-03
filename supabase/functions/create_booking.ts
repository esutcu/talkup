// supabase/functions/create_booking.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { nanoid } from 'https://esm.sh/nanoid@4.0.2'

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
    const { studentId, teacherId, date, startTime } = await req.json()

    if (!studentId || !teacherId || !date || !startTime) {
      throw new Error('Öğrenci ID, öğretmen ID, tarih ve saat zorunludur')
    }

    // Supabase client oluştur
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL veya Service Role Key eksik')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // 1. Kullanıcının yeterli kredisi var mı kontrol et
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('credits')
      .eq('id', studentId)
      .single()

    if (userError) throw userError

    if (!userData.credits || userData.credits < 1) {
      throw new Error('Yetersiz kredi')
    }

    // 2. Slot müsait mi kontrol et - FOR UPDATE SKIP LOCKED ile kilitlenir
    // Bu blok, PostgreSQL'in SKIP LOCKED özelliğini kullanarak race condition'ları önler
    const { data: slotData, error: slotError } = await supabaseClient.rpc(
      'check_and_lock_slot',
      {
        p_teacher_id: teacherId,
        p_date: date,
        p_start_time: startTime
      }
    )

    if (slotError) throw slotError

    if (!slotData || !slotData.id) {
      throw new Error('Bu slot müsait değil veya başka bir kullanıcı tarafından rezerve edilmiş')
    }

    // 3. Transaction başlat
    // tüm işlemler bir transaction içinde yapılır - ya hepsi başarılı olur ya da hiçbiri (rollback)
    const bookingId = crypto.randomUUID ? crypto.randomUUID() : self.crypto.randomUUID();
    const { data: transactionResult, error: transactionError } = await supabaseClient.rpc(
      'create_booking_transaction',
      {
        p_booking_id: bookingId,
        p_student_id: studentId,
        p_teacher_id: teacherId,
        p_date: date,
        p_start_time: startTime,
        p_slot_id: slotData.id
      }
    )

    if (transactionError) throw transactionError

    // 4. Google Meet linki oluştur
    const meetId = nanoid(10)
    const part1 = meetId.substring(0, 3)
    const part2 = meetId.substring(3, 7)
    const part3 = meetId.substring(7, 10)
    const meetLink = `https://meet.google.com/${part1}-${part2}-${part3}`

    // 5. Booking'i Meet linki ile güncelle
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({ meet_link: meetLink })
      .eq('id', transactionResult.booking_id)

    if (updateError) throw updateError

    // 6. Bildirim gönder
    await supabaseClient
      .from('notifications')
      .insert([
        {
          user_id: teacherId,
          type: 'booking_created',
          title: 'Yeni Rezervasyon',
          message: `${date} tarihinde ${startTime} saatinde yeni bir dersiniz var.`
        },
        {
          user_id: studentId,
          type: 'booking_confirmed',
          title: 'Rezervasyon Onaylandı',
          message: `${date} tarihinde ${startTime} saatinde rezervasyonunuz onaylandı.`
        }
      ])

    // 7. Yanıtı döndür
    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingId: transactionResult.booking_id,
        meetLink
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