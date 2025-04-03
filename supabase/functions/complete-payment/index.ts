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
    const { token, packageId, userId } = await req.json()
    
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
    const { data: packageData, error: packageError } = await supabaseClient
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single()

    if (packageError) throw packageError

    // Kredi ekle ve işlemi güncelle
    await supabaseClient.transaction(async (tx) => {
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