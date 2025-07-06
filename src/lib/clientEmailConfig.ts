// Client-Specific Email Configuration
// This allows each client to use their own email provider

export interface ClientEmailConfig {
  clientId: string;
  provider: 'sendgrid' | 'mailgun' | 'resend' | 'mock';
  apiKey?: string;
  domain?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

export class ClientEmailService {
  private static clientConfigs: Map<string, ClientEmailConfig> = new Map();

  // Register a client's email configuration
  static registerClient(clientId: string, config: ClientEmailConfig): void {
    this.clientConfigs.set(clientId, config);
    console.log(`Registered email config for client: ${clientId}`);
  }

  // Get client's email configuration
  static getClientConfig(clientId: string): ClientEmailConfig | null {
    return this.clientConfigs.get(clientId) || null;
  }

  // Send email for a specific client
  static async sendClientEmail(
    clientId: string,
    to: string,
    template: EmailTemplate,
    campaignName: string,
    pdfContent?: string
  ): Promise<void> {
    const config = this.getClientConfig(clientId);
    if (!config) {
      throw new Error(`No email configuration found for client: ${clientId}`);
    }

    try {
      console.log(`Sending email for client ${clientId} to ${to}`);

      // Generate PDF and upload if provided
      let pdfUrl = '';
      if (pdfContent) {
        pdfUrl = await this.uploadPDF(pdfContent, clientId, campaignName);
      }

      // Send email based on provider
      await this.sendViaProvider(config, to, template, pdfUrl);

      console.log(`Email sent successfully for client ${clientId}`);
      
    } catch (error) {
      console.error(`Failed to send email for client ${clientId}:`, error);
      throw new Error(`Email delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Upload PDF to storage
  private static async uploadPDF(pdfContent: string, clientId: string, campaignName: string): Promise<string> {
    try {
      const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
      const filename = `pdfs/${clientId}/${campaignName}_${Date.now()}.pdf`;
      
      // Upload to Supabase Storage
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase.storage
        .from('lead-magnets')
        .upload(filename, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (error) {
        throw new Error(`Failed to upload PDF: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('lead-magnets')
        .getPublicUrl(filename);

      return urlData.publicUrl;
      
    } catch (error) {
      console.error('PDF upload failed:', error);
      return `https://yourdomain.com/pdf/${clientId}/${campaignName}`;
    }
  }

  // Send email via configured provider
  private static async sendViaProvider(
    config: ClientEmailConfig,
    to: string,
    template: EmailTemplate,
    pdfUrl: string
  ): Promise<void> {
    switch (config.provider) {
      case 'sendgrid':
        await this.sendViaSendGrid(config, to, template, pdfUrl);
        break;
      case 'mailgun':
        await this.sendViaMailgun(config, to, template, pdfUrl);
        break;
      case 'resend':
        await this.sendViaResend(config, to, template, pdfUrl);
        break;
      case 'mock':
        await this.sendViaMock(config, to, template, pdfUrl);
        break;
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`);
    }
  }

  // SendGrid integration
  private static async sendViaSendGrid(
    config: ClientEmailConfig,
    to: string,
    template: EmailTemplate,
    pdfUrl: string
  ): Promise<void> {
    if (!config.apiKey) {
      throw new Error('SendGrid API key not configured');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: config.fromEmail, name: config.fromName },
        reply_to: config.replyTo ? { email: config.replyTo } : undefined,
        subject: template.subject,
        content: [
          { type: 'text/plain', value: template.textBody },
          { type: 'text/html', value: template.htmlBody }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid error: ${error}`);
    }
  }

  // Mailgun integration
  private static async sendViaMailgun(
    config: ClientEmailConfig,
    to: string,
    template: EmailTemplate,
    pdfUrl: string
  ): Promise<void> {
    if (!config.apiKey || !config.domain) {
      throw new Error('Mailgun API key and domain required');
    }

    const formData = new FormData();
    formData.append('from', `${config.fromName} <${config.fromEmail}>`);
    formData.append('to', to);
    formData.append('subject', template.subject);
    formData.append('text', template.textBody);
    formData.append('html', template.htmlBody);
    if (config.replyTo) {
      formData.append('h:Reply-To', config.replyTo);
    }

    const response = await fetch(`https://api.mailgun.net/v3/${config.domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${config.apiKey}`)}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mailgun error: ${error}`);
    }
  }

  // Resend integration
  private static async sendViaResend(
    config: ClientEmailConfig,
    to: string,
    template: EmailTemplate,
    pdfUrl: string
  ): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Resend API key not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: [to],
        subject: template.subject,
        html: template.htmlBody,
        text: template.textBody,
        reply_to: config.replyTo
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend error: ${error}`);
    }
  }

  // Mock email sender for development
  private static async sendViaMock(
    config: ClientEmailConfig,
    to: string,
    template: EmailTemplate,
    pdfUrl: string
  ): Promise<void> {
    console.log('📧 Mock Email Sent:');
    console.log('Client:', config.fromName);
    console.log('From:', config.fromEmail);
    console.log('To:', to);
    console.log('Subject:', template.subject);
    console.log('PDF URL:', pdfUrl);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Mock email sent successfully');
  }

  // Create welcome email template for client
  static createWelcomeTemplate(
    clientName: string,
    campaignName: string,
    pdfUrl: string
  ): EmailTemplate {
    return {
      id: 'welcome',
      name: 'Welcome Email',
      subject: `Your ${campaignName} is Ready! 🎉`,
      htmlBody: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Guide is Ready!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Your Guide is Ready! 🎉</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin-top: 0;">Thank you for signing up!</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Your <strong>${campaignName}</strong> from <strong>${clientName}</strong> is now ready for download. This comprehensive guide contains everything you need to succeed.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${pdfUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
                📥 Download Your Guide
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${pdfUrl}" style="color: #667eea;">${pdfUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Questions? Reply to this email or contact ${clientName} directly.
            </p>
            <p style="color: #999; font-size: 12px;">
              © 2025 ${clientName}. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      textBody: `
Your ${campaignName} is Ready! 🎉

Thank you for signing up!

Your comprehensive guide from ${clientName} is now ready for download. This guide contains everything you need to succeed.

Download your guide here: ${pdfUrl}

Questions? Reply to this email or contact ${clientName} directly.

© 2025 ${clientName}. All rights reserved.
      `
    };
  }
} 