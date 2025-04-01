# supabase/functions/initialize-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Iyzipay from 'https://esm.sh/iyzipay'

const iyzipay = new Iyzipay({
  apiKey: Deno.env.get('IYZIPAY_API_KEY'),
  secretKey: Deno.env.get('IYZIPAY_SECRET_KEY'),
  uri: Deno.env.get('IYZIPAY_BASE_URL')
})

serve(async (req) => {
  try {
    const { packageId, userId, price, paidPrice } = await req.json()

    // Kullanıcı bilgilerini al
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Ödeme isteği oluştur
    const request = {
      locale: 'tr',
      conversationId: `${packageId}-${Date.now()}`,
      price: price.toString(),
      paidPrice: paidPrice.toString(),
      currency: 'TRY',
      basketId: packageId,
      paymentGroup: 'PRODUCT',
      callbackUrl: `${Deno.env.get('PUBLIC_URL')}/payment/callback`,
      enabledInstallments: [1],
      buyer: {
        id: userId,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        identityNumber: '11111111111',
        registrationAddress: 'Türkiye',
        city: 'Istanbul',
        country: 'Turkey',
        ip: req.headers.get('x-real-ip') || '127.0.0.1'
      },
      basketItems: [
        {
          id: packageId,
          name: 'Kredi Paketi',
          category1: 'Kredi',
          itemType: 'VIRTUAL',
          price: price.toString()
        }
      ]
    }

    // Ödeme formu oluştur
    const result = await new Promise((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(request, (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })

    // İşlemi veritabanına kaydet
    await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        package_id: packageId,
        amount: price,
        currency: 'TRY',
        conversation_id: request.conversationId,
        status: 'pending'
      })

    return new Response(
      JSON.stringify(result),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})