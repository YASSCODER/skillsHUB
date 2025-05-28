import nodemailer from 'nodemailer';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

export class ContactService {
  private static createTransporter() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Send contact form email to support team
  static async sendContactEmail(formData: ContactFormData) {
    console.log("=== SENDING CONTACT EMAIL ===");
    console.log("Form data:", formData);

    try {
      const transporter = this.createTransporter();

      // Email to support team
      const supportEmailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to same email for now
        subject: `Contact Form: ${formData.subject}`,
        html: this.generateSupportEmailTemplate(formData),
        text: this.generateSupportEmailText(formData)
      };

      // Auto-reply email to user
      const userEmailOptions = {
        from: process.env.EMAIL_USER,
        to: formData.email,
        subject: 'Thank you for contacting SmartSkillz',
        html: this.generateUserEmailTemplate(formData),
        text: this.generateUserEmailText(formData)
      };

      // Send support email first
      const supportResult = await new Promise((resolve, reject) => {
        transporter.sendMail(supportEmailOptions, (error, info) => {
          if (error) {
            console.error("Error sending support email:", error);
            reject(error);
          } else {
            console.log("Support email sent:", info.messageId);
            resolve(info);
          }
        });
      });

      // Send user auto-reply
      const userResult = await new Promise((resolve, reject) => {
        transporter.sendMail(userEmailOptions, (error, info) => {
          if (error) {
            console.error("Error sending user email:", error);
            reject(error);
          } else {
            console.log("User auto-reply sent:", info.messageId);
            resolve(info);
          }
        });
      });

      return {
        success: true,
        supportEmailId: (supportResult as any).messageId,
        userEmailId: (userResult as any).messageId,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error("Error sending contact emails:", error);
      throw new Error(`Failed to send contact emails: ${error.message}`);
    }
  }

  // Generate HTML email template for support team
  private static generateSupportEmailTemplate(formData: ContactFormData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; padding: 10px; background: white; border-left: 4px solid #3B82F6; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Contact Form Submission</h1>
            <p>SmartSkillz Support Portal</p>
          </div>

          <div class="content">
            <div class="field">
              <div class="label">👤 Name:</div>
              <div class="value">${formData.name}</div>
            </div>

            <div class="field">
              <div class="label">📧 Email:</div>
              <div class="value">${formData.email}</div>
            </div>

            <div class="field">
              <div class="label">📝 Subject:</div>
              <div class="value">${formData.subject}</div>
            </div>

            <div class="field">
              <div class="label">💬 Message:</div>
              <div class="value">${formData.message.replace(/\n/g, '<br>')}</div>
            </div>

            <div class="field">
              <div class="label">🕒 Submitted:</div>
              <div class="value">${new Date(formData.timestamp).toLocaleString()}</div>
            </div>
          </div>

          <div class="footer">
            <p>This email was sent from the SmartSkillz contact form.</p>
            <p>Please respond to the user at: ${formData.email}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate plain text email for support team
  private static generateSupportEmailText(formData: ContactFormData): string {
    return `
NEW CONTACT FORM SUBMISSION - SmartSkillz

Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

Submitted: ${new Date(formData.timestamp).toLocaleString()}

Please respond to the user at: ${formData.email}
    `;
  }

  // Generate HTML auto-reply template for user
  private static generateUserEmailTemplate(formData: ContactFormData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Thank you for contacting SmartSkillz</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .highlight { background: #E0F2FE; padding: 15px; border-left: 4px solid #3B82F6; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Thank You for Contacting Us!</h1>
            <p>SmartSkillz Support Team</p>
          </div>

          <div class="content">
            <p>Dear ${formData.name},</p>

            <p>Thank you for reaching out to SmartSkillz! We have received your message and our support team will review it shortly.</p>

            <div class="highlight">
              <strong>📝 Your Message Summary:</strong><br>
              <strong>Subject:</strong> ${formData.subject}<br>
              <strong>Submitted:</strong> ${new Date(formData.timestamp).toLocaleString()}
            </div>

            <p><strong>⏰ What happens next?</strong></p>
            <ul>
              <li>Our support team will review your message within 24 hours</li>
              <li>You'll receive a detailed response at this email address</li>
              <li>For urgent matters, you can also call us at +1 (555) 123-4567</li>
            </ul>

            <p>In the meantime, feel free to explore our platform and discover new learning opportunities!</p>

            <p>Best regards,<br>
            <strong>The SmartSkillz Support Team</strong></p>
          </div>

          <div class="footer">
            <p>This is an automated response. Please do not reply to this email.</p>
            <p>For immediate assistance, contact us at support@smartskillz.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate plain text auto-reply for user
  private static generateUserEmailText(formData: ContactFormData): string {
    return `
Thank you for contacting SmartSkillz!

Dear ${formData.name},

We have received your message about "${formData.subject}" and our support team will review it shortly.

What happens next?
- Our support team will review your message within 24 hours
- You'll receive a detailed response at this email address
- For urgent matters, you can call us at +1 (555) 123-4567

Thank you for choosing SmartSkillz!

Best regards,
The SmartSkillz Support Team

---
This is an automated response. Please do not reply to this email.
For immediate assistance, contact us at support@smartskillz.com
    `;
  }
}
