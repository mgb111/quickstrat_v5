import { supabase } from './supabase';

// Email service configuration
interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'resend' | 'mock';
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
}

// Email template interface
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

export class EmailService {
  private static config: EmailConfig = {
    provider: 'mock', // Default to mock for development
    fromEmail: import.meta.env.VITE_FROM_EMAIL || 'noreply@yourdomain.com',
    fromName: import.meta.env.VITE_FROM_NAME || 'LeadGen Machine'
  };

  // Initialize email service with configuration
  static initialize(config: EmailConfig) {
    this.config = { ...this.config, ...config };
  }

  // Send welcome email with PDF attachment
  static async sendWelcomeEmail(email: string, campaignId: string, pdfContent: string, campaignName: string): Promise<void> {
    try {
      console.log(`Sending welcome email to ${email} for campaign ${campaignName}`);
      
      // Generate PDF and upload to storage
      const pdfUrl = await this.uploadPDF(pdfContent, campaignId, email);
      
      // Create email template
      const template = this.createWelcomeEmailTemplate(campaignName, pdfUrl);
      
      // Send email based on provider
      await this.sendEmail(email, template);
      
      // Mark email as sent in database
      await supabase
        .from('emails')
        .update({ 
          email_sent: true,
          sent_at: new Date().toISOString()
        })
        .eq('email', email)
        .eq('campaign_id', campaignId);

      console.log(`Welcome email sent successfully to ${email}`);
      
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error(`Failed to send welcome email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Upload PDF to storage and return URL
  private static async uploadPDF(pdfContent: string, campaignId: string, email: string): Promise<string> {
    try {
      // Convert PDF content to blob
      const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
      
      // Generate unique filename
      const filename = `pdfs/${campaignId}/${email.replace('@', '_at_')}_${Date.now()}.pdf`;
      
      // Upload to Supabase Storage
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
      // Fallback to a placeholder URL
      return `https://yourdomain.com/pdf/${campaignId}`;
    }
  }

  // Create welcome email template
  private static createWelcomeEmailTemplate(campaignName: string, pdfUrl: string): EmailTemplate {
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
              Your <strong>${campaignName}</strong> is now ready for download. This comprehensive guide contains everything you need to succeed.
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
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
            <h3 style="color: #2c3e50; margin-top: 0;">What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Download and review your guide</li>
              <li>Implement the strategies step by step</li>
              <li>Track your progress and results</li>
              <li>Stay tuned for additional resources</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Questions? Reply to this email or contact us at support@yourdomain.com
            </p>
            <p style="color: #999; font-size: 12px;">
              © 2025 LeadGen Machine. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      textBody: `
Your ${campaignName} is Ready! 🎉

Thank you for signing up!

Your comprehensive guide is now ready for download. This guide contains everything you need to succeed.

Download your guide here: ${pdfUrl}

What's Next?
- Download and review your guide
- Implement the strategies step by step
- Track your progress and results
- Stay tuned for additional resources

Questions? Reply to this email or contact us at support@yourdomain.com

© 2025 LeadGen Machine. All rights reserved.
      `
    };
  }

  // Send email based on configured provider
  private static async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    switch (this.config.provider) {
      case 'sendgrid':
        await this.sendViaSendGrid(to, template);
        break;
      case 'mailgun':
        await this.sendViaMailgun(to, template);
        break;
      case 'resend':
        await this.sendViaResend(to, template);
        break;
      case 'mock':
      default:
        await this.sendViaMock(to, template);
        break;
    }
  }

  // SendGrid integration
  private static async sendViaSendGrid(to: string, template: EmailTemplate): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key not configured');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: this.config.fromEmail, name: this.config.fromName },
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
  private static async sendViaMailgun(to: string, template: EmailTemplate): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Mailgun API key not configured');
    }

    const formData = new FormData();
    formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
    formData.append('to', to);
    formData.append('subject', template.subject);
    formData.append('text', template.textBody);
    formData.append('html', template.htmlBody);

    const response = await fetch(`https://api.mailgun.net/v3/${import.meta.env.VITE_MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mailgun error: ${error}`);
    }
  }

  // Resend integration
  private static async sendViaResend(to: string, template: EmailTemplate): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Resend API key not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [to],
        subject: template.subject,
        html: template.htmlBody,
        text: template.textBody
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend error: ${error}`);
    }
  }

  // Mock email sender for development
  private static async sendViaMock(to: string, template: EmailTemplate): Promise<void> {
    console.log('📧 Mock Email Sent:');
    console.log('To:', to);
    console.log('Subject:', template.subject);
    console.log('HTML Body Preview:', template.htmlBody.substring(0, 200) + '...');
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Mock email sent successfully');
  }

  // Send follow-up emails
  static async sendFollowUpEmail(email: string, campaignId: string, followUpNumber: number): Promise<void> {
    try {
      console.log(`Sending follow-up email #${followUpNumber} to ${email}`);
      
      const template = this.createFollowUpTemplate(followUpNumber, campaignId);
      await this.sendEmail(email, template);
      
      // Mark follow-up as sent
      await supabase
        .from('emails')
        .update({ 
          follow_up_sent: true,
          follow_up_number: followUpNumber,
          sent_at: new Date().toISOString()
        })
        .eq('email', email)
        .eq('campaign_id', campaignId);
      
    } catch (error) {
      console.error('Failed to send follow-up email:', error);
      throw new Error(`Failed to send follow-up email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create follow-up email template
  private static createFollowUpTemplate(followUpNumber: number, campaignId: string): EmailTemplate {
    const templates = [
      {
        subject: 'How is your guide working for you? 🤔',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>How is your guide working for you?</h2>
            <p>I hope you found the guide helpful! I'd love to hear about your progress and answer any questions you might have.</p>
            <p>What's been working well? What challenges are you facing?</p>
            <p>Reply to this email - I'm here to help!</p>
          </div>
        `,
        textBody: `
How is your guide working for you?

I hope you found the guide helpful! I'd love to hear about your progress and answer any questions you might have.

What's been working well? What challenges are you facing?

Reply to this email - I'm here to help!
        `
      },
      {
        subject: 'Ready for the next level? 🚀',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Ready for the next level?</h2>
            <p>You've been implementing the strategies from your guide. Now it's time to take it to the next level!</p>
            <p>I have some advanced techniques and additional resources that could help you accelerate your results.</p>
            <p>Would you like to learn more?</p>
          </div>
        `,
        textBody: `
Ready for the next level?

You've been implementing the strategies from your guide. Now it's time to take it to the next level!

I have some advanced techniques and additional resources that could help you accelerate your results.

Would you like to learn more?
        `
      }
    ];

    const template = templates[followUpNumber - 1] || templates[0];
    
    return {
      id: `follow-up-${followUpNumber}`,
      name: `Follow-up ${followUpNumber}`,
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody
    };
  }

  // Get email templates for a campaign
  static async getEmailTemplates(campaignId: string): Promise<EmailTemplate[]> {
    try {
      // In a real implementation, you would fetch email templates from the database
      // For now, return default templates
      return [
        {
          id: 'welcome',
          name: 'Welcome Email',
          subject: 'Your Free Guide is Ready!',
          htmlBody: '<p>Thank you for signing up! Here\'s your free guide...</p>',
          textBody: 'Thank you for signing up! Here\'s your free guide...'
        },
        {
          id: 'follow-up-1',
          name: 'Follow-up 1',
          subject: 'How is your guide working for you?',
          htmlBody: '<p>I hope you found the guide helpful...</p>',
          textBody: 'I hope you found the guide helpful...'
        }
      ];
    } catch (error) {
      console.error('Failed to get email templates:', error);
      throw new Error('Failed to get email templates');
    }
  }

  // Schedule follow-up emails
  static async scheduleFollowUpEmails(campaignId: string): Promise<void> {
    try {
      // Get all leads for the campaign
      const { data: leads } = await supabase
        .from('leads')
        .select('email, captured_at')
        .eq('campaign_id', campaignId);

      if (!leads) return;

      // Schedule follow-up emails based on timing rules
      for (const lead of leads) {
        const capturedDate = new Date(lead.captured_at);
        const now = new Date();
        const daysSinceCapture = Math.floor((now.getTime() - capturedDate.getTime()) / (1000 * 60 * 60 * 24));

        // Send follow-up 1 after 3 days
        if (daysSinceCapture >= 3) {
          await this.sendFollowUpEmail(lead.email, campaignId, 1);
        }

        // Send follow-up 2 after 7 days
        if (daysSinceCapture >= 7) {
          await this.sendFollowUpEmail(lead.email, campaignId, 2);
        }
      }
      
      console.log(`Scheduled follow-up emails for campaign ${campaignId}`);
      
    } catch (error) {
      console.error('Failed to schedule follow-up emails:', error);
      throw new Error('Failed to schedule follow-up emails');
    }
  }
} 