# supabase/functions/complete-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Iyzipay from 'https://esm.sh/iyzipay'

const iyzipay = new Iyzipay({
  apiKey: Deno.env.get('IYZIPAY_API_KEY'),
  secretKey: Deno.env.get('IYZIPAY_SECRET_KEY'),
  uri: Deno.env.get('IYZIPAY_BASE_URL')
})

serve(async (req) => {
  try {
    const { token, packageId, userId } = await req.json()

    // Ödeme sonucunu kontrol et
    const result = await new Promise((resolve, reject) => {
      iyzipay.checkoutForm.retrieve({
        token: token
      }, (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })

    if (result.status !== 'success') {
      throw new Error('Ödeme başarısız')
    }

    // Paketi al
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single()

    if (packageError) throw packageError

    // Kredi ekle ve işlemi güncelle
    await supabase.transaction(async (tx) => {
      // Kullanıcıya kredi ekle
      await tx
        .from('users')
        .update({ 
          credits: sql`credits + ${packageData.credit_amount}` 
        })
        .eq('id', userId)

      // Ödeme işlemini tamamlandı olarak işaretle
      await tx
        .from('payment_transactions')
        .update({ 
          status: 'completed',
          payment_id: result.paymentId
        })
        .eq('conversation_id', result.conversationId)

      // Kredi işlem kaydı oluştur
      await tx
        .from('credit_transactions')
        .insert({
          user_id: userId,
          package_id: packageId,
          amount: packageData.credit_amount,
          type: 'purchase',
          price: packageData.price
        })
    })

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