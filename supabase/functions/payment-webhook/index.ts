# supabase/functions/payment-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// Webhook secret kontrolü için
const WEBHOOK_SECRET = Deno.env.get('IYZIPAY_WEBHOOK_SECRET')

serve(async (req) => {
  try {
    // Gelen webhook secret kontrolü
    const signature = req.headers.get('x-iyzico-signature')
    if (!signature || signature !== WEBHOOK_SECRET) {
      throw new Error('Invalid webhook signature')
    }

    const payload = await req.json()
    const { status, paymentId, conversationId, token } = payload

    // Supabase client oluştur
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Ödeme işlemini bul
    const { data: transaction, error: transactionError } = await supabase
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
        await handleSuccessfulPayment(supabase, transaction)
        break
      
      case 'FAILURE':
        await handleFailedPayment(supabase, transaction)
        break
      
      case 'INIT_FAILED':
        await handleInitFailure(supabase, transaction)
        break

      default:
        throw new Error(`Unknown payment status: ${status}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function handleSuccessfulPayment(supabase: any, transaction: any) {
  // Başarılı ödeme senaryosu
  await supabase.transaction(async (tx: any) => {
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

async function handleFailedPayment(supabase: any, transaction: any) {
  // Başarısız ödeme senaryosu
  await supabase.transaction(async (tx: any) => {
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

async function handleInitFailure(supabase: any, transaction: any) {
  // Ödeme başlatma hatası senaryosu
  await supabase
    .from('payment_transactions')
    .update({ 
      status: 'init_failed',
    })
    .eq('id', transaction.id)
}