import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Iyzipay from 'https://esm.sh/iyzipay'

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
    const { packageId, userId, price, paidPrice } = await req.json()
    
    // API anahtarlarını kontrol et
    const apiKey = Deno.env.get('IYZIPAY_API_KEY')
    const secretKey = Deno.env.get('IYZIPAY_SECRET_KEY')
    const baseUrl = Deno.env.get('IYZIPAY_BASE_URL')
    
    if (!apiKey || !secretKey || !baseUrl) {
      throw new Error('Iyzipay API bilgileri eksik')
    }

    const iyzipay = new Iyzipay({
      apiKey,
      secretKey,
      uri: baseUrl
    })

    // Supabase client oluştur
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL veya Service Role Key eksik')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Kullanıcı bilgilerini al
    const { data: userData, error: userError } = await supabaseClient
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
    await supabaseClient
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