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
    // Webhook secret kontrolü için
    const WEBHOOK_SECRET = Deno.env.get('IYZIPAY_WEBHOOK_SECRET')
    
    // Gelen webhook secret kontrolü
    const signature = req.headers.get('x-iyzico-signature')
    if (!signature || signature !== WEBHOOK_SECRET) {
      throw new Error('Invalid webhook signature')
    }

    const payload = await req.json()
    const { status, paymentId, conversationId, token } = payload

    // Supabase client oluştur
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL veya Service Role Key eksik')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Ödeme işlemini bul
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .select(`
        *,
        package:package_id (
          credit_amount
        ),
        user:user_id (
          credits
        )
      `)
      .eq('conversation_id', conversationId)
      .single()

    if (transactionError) throw transactionError

    // Status kontrolü ve işlem
    switch (status) {
      case 'SUCCESS':
        await handleSuccessfulPayment(supabaseClient, transaction)
        break
      
      case 'FAILURE':
        await handleFailedPayment(supabaseClient, transaction)
        break
      
      case 'INIT_FAILED':
        await handleInitFailure(supabaseClient, transaction)
        break

      default:
        throw new Error(`Unknown payment status: ${status}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
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

async function handleSuccessfulPayment(supabaseClient, transaction) {
  // Başarılı ödeme senaryosu
  await supabaseClient.transaction(async (tx) => {
    // Kullanıcıya kredileri ekle
    await tx
      .from('users')
      .update({ 
        credits: transaction.user.credits + transaction.package.credit_amount 
      })
      .eq('id', transaction.user_id)

    // İşlem durumunu güncelle
    await tx
      .from('payment_transactions')
      .update({ 
        status: 'completed',
      })
      .eq('id', transaction.id)

    // Kredi işlem kaydı oluştur
    await tx
      .from('credit_transactions')
      .insert({
        user_id: transaction.user_id,
        package_id: transaction.package_id,
        amount: transaction.package.credit_amount,
        type: 'purchase',
        price: transaction.amount
      })

    // Bildirim gönder
    await tx
      .from('notifications')
      .insert({
        user_id: transaction.user_id,
        type: 'payment_success',
        title: 'Ödeme Başarılı',
        message: `${transaction.package.credit_amount} kredi hesabınıza tanımlandı.`
      })
  })
}

async function handleFailedPayment(supabaseClient, transaction) {
  // Başarısız ödeme senaryosu
  await supabaseClient.transaction(async (tx) => {
    // İşlem durumunu güncelle
    await tx
      .from('payment_transactions')
      .update({ 
        status: 'failed',
      })
      .eq('id', transaction.id)

    // Bildirim gönder
    await tx
      .from('notifications')
      .insert({
        user_id: transaction.user_id,
        type: 'payment_failed',
        title: 'Ödeme Başarısız',
        message: 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.'
      })
  })
}

async function handleInitFailure(supabaseClient, transaction) {
  // Ödeme başlatma hatası senaryosu
  await supabaseClient
    .from('payment_transactions')
    .update({ 
      status: 'init_failed',
    })
    .eq('id', transaction.id)
}