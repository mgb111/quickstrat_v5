import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  email: string
  campaignData: {
    brandName: string
    pdfContent: any
    landingPage: any
    socialPosts: any
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, campaignData }: EmailRequest = await req.json()

    // For now, we'll simulate email sending and return success
    // In production, you would integrate with Resend, SendGrid, or another email service
    
    console.log(`Sending email to: ${email}`)
    console.log(`Campaign for: ${campaignData.brandName}`)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Here you would integrate with your email service:
    /*
    const emailService = new Resend(Deno.env.get('RESEND_API_KEY'))
    
    await emailService.emails.send({
      from: 'noreply@yourdomain.com',
      to: email,
      subject: `Your ${campaignData.brandName} Lead Magnet is Ready!`,
      html: generateEmailTemplate(campaignData),
      attachments: [
        {
          filename: `${campaignData.brandName}-lead-magnet.pdf`,
          content: generatePDFBuffer(campaignData.pdfContent)
        }
      ]
    })
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email: email 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})