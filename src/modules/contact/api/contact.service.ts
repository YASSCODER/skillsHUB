import nodemailer from 'nodemailer';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

interface WalletActivationRequestData {
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  message: string;
  priority: string;
  walletId: string;
  requestType: string;
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

  // Send wallet activation request email to support team
  static async sendWalletActivationEmail(requestData: WalletActivationRequestData) {
    console.log("=== SENDING WALLET ACTIVATION EMAIL ===");
    console.log("Request data:", requestData);

    try {
      const transporter = this.createTransporter();

      // Email to support team
      const supportEmailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to support email
        subject: `🏆 Wallet Activation Request - ${this.getPriorityEmoji(requestData.priority)} ${requestData.priority.toUpperCase()} Priority`,
        html: this.generateWalletActivationSupportTemplate(requestData),
        text: this.generateWalletActivationSupportText(requestData)
      };

      // Auto-reply email to user
      const userEmailOptions = {
        from: process.env.EMAIL_USER,
        to: requestData.userEmail,
        subject: '🏆 Wallet Activation Request Received - SmartSkillz',
        html: this.generateWalletActivationUserTemplate(requestData),
        text: this.generateWalletActivationUserText(requestData)
      };

      // Send support email first
      const supportResult = await new Promise((resolve, reject) => {
        transporter.sendMail(supportEmailOptions, (error, info) => {
          if (error) {
            console.error("Error sending wallet activation support email:", error);
            reject(error);
          } else {
            console.log("Wallet activation support email sent:", info.messageId);
            resolve(info);
          }
        });
      });

      // Send user auto-reply
      const userResult = await new Promise((resolve, reject) => {
        transporter.sendMail(userEmailOptions, (error, info) => {
          if (error) {
            console.error("Error sending wallet activation user email:", error);
            reject(error);
          } else {
            console.log("Wallet activation user auto-reply sent:", info.messageId);
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
      console.error("Error sending wallet activation emails:", error);
      throw new Error(`Failed to send wallet activation emails: ${error.message}`);
    }
  }

  // Helper method to get priority emoji
  private static getPriorityEmoji(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🟡';
    }
  }

  // Helper method to get reason label
  private static getReasonLabel(reason: string): string {
    switch (reason) {
      case 'account_review': return 'Account Review Completed';
      case 'payment_resolved': return 'Payment Issue Resolved';
      case 'policy_compliance': return 'Policy Compliance Addressed';
      case 'technical_issue': return 'Technical Issue Resolution';
      case 'other': return 'Other (See message for details)';
      default: return reason;
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

  // Generate HTML email template for wallet activation support team
  private static generateWalletActivationSupportTemplate(requestData: WalletActivationRequestData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Wallet Activation Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; padding: 10px; background: white; border-left: 4px solid #ec4899; }
          .priority-high { border-left-color: #ef4444; background: #fef2f2; }
          .priority-medium { border-left-color: #f59e0b; background: #fffbeb; }
          .priority-low { border-left-color: #10b981; background: #f0fdf4; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .action-button { background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Wallet Activation Request</h1>
            <p>SmartSkillz Admin Portal</p>
            <p>${this.getPriorityEmoji(requestData.priority)} ${requestData.priority.toUpperCase()} Priority</p>
          </div>

          <div class="content">
            <div class="field">
              <div class="label">👤 User Information:</div>
              <div class="value">
                <strong>Name:</strong> ${requestData.userName}<br>
                <strong>Email:</strong> ${requestData.userEmail}<br>
                <strong>User ID:</strong> ${requestData.userId}
              </div>
            </div>

            <div class="field">
              <div class="label">💳 Wallet Information:</div>
              <div class="value">
                <strong>Wallet ID:</strong> ${requestData.walletId}<br>
                <strong>Status:</strong> Currently Deactivated
              </div>
            </div>

            <div class="field">
              <div class="label">📝 Request Details:</div>
              <div class="value priority-${requestData.priority}">
                <strong>Reason:</strong> ${this.getReasonLabel(requestData.reason)}<br>
                <strong>Priority:</strong> ${this.getPriorityEmoji(requestData.priority)} ${requestData.priority.toUpperCase()}<br>
                <strong>Request Type:</strong> ${requestData.requestType}
              </div>
            </div>

            <div class="field">
              <div class="label">💬 User Message:</div>
              <div class="value">${requestData.message.replace(/\n/g, '<br>')}</div>
            </div>

            <div class="field">
              <div class="label">🕒 Request Submitted:</div>
              <div class="value">${new Date(requestData.timestamp).toLocaleString()}</div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <h3>🔧 Admin Actions Required:</h3>
              <p>Please review this wallet activation request and take appropriate action.</p>
              <a href="mailto:${requestData.userEmail}" class="action-button">📧 Contact User</a>
            </div>
          </div>

          <div class="footer">
            <p>This email was sent from the SmartSkillz wallet activation system.</p>
            <p>Please respond to the user at: ${requestData.userEmail}</p>
            <p>Request ID: ${requestData.walletId}-${Date.now()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate plain text email for wallet activation support team
  private static generateWalletActivationSupportText(requestData: WalletActivationRequestData): string {
    return `
WALLET ACTIVATION REQUEST - SmartSkillz
Priority: ${requestData.priority.toUpperCase()}

User Information:
- Name: ${requestData.userName}
- Email: ${requestData.userEmail}
- User ID: ${requestData.userId}

Wallet Information:
- Wallet ID: ${requestData.walletId}
- Status: Currently Deactivated

Request Details:
- Reason: ${this.getReasonLabel(requestData.reason)}
- Priority: ${requestData.priority.toUpperCase()}
- Request Type: ${requestData.requestType}

User Message:
${requestData.message}

Request Submitted: ${new Date(requestData.timestamp).toLocaleString()}

Admin Actions Required:
Please review this wallet activation request and take appropriate action.

Contact user at: ${requestData.userEmail}
Request ID: ${requestData.walletId}-${Date.now()}
    `;
  }

  // Generate HTML auto-reply template for wallet activation user
  private static generateWalletActivationUserTemplate(requestData: WalletActivationRequestData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Wallet Activation Request Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .highlight { background: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .status-box { background: #e0f2fe; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Request Received Successfully!</h1>
            <p>SmartSkillz Support Team</p>
          </div>

          <div class="content">
            <p>Dear ${requestData.userName},</p>

            <p>Thank you for submitting your wallet activation request. We have received your request and our admin team will review it promptly.</p>

            <div class="status-box">
              <h3>📋 Request Summary</h3>
              <p><strong>Request Type:</strong> Wallet Activation</p>
              <p><strong>Priority Level:</strong> ${this.getPriorityEmoji(requestData.priority)} ${requestData.priority.charAt(0).toUpperCase() + requestData.priority.slice(1)}</p>
              <p><strong>Reason:</strong> ${this.getReasonLabel(requestData.reason)}</p>
              <p><strong>Submitted:</strong> ${new Date(requestData.timestamp).toLocaleString()}</p>
            </div>

            <div class="highlight">
              <strong>⏰ What happens next?</strong><br>
              <ul>
                <li><strong>Review Process:</strong> Our admin team will review your request within 24-48 hours</li>
                <li><strong>Priority Handling:</strong> ${requestData.priority === 'high' ? 'High priority requests are reviewed within 12 hours' : requestData.priority === 'medium' ? 'Medium priority requests are reviewed within 24 hours' : 'Low priority requests are reviewed within 48 hours'}</li>
                <li><strong>Email Updates:</strong> You'll receive email notifications about the status of your request</li>
                <li><strong>Wallet Activation:</strong> Once approved, your wallet will be reactivated automatically</li>
              </ul>
            </div>

            <p><strong>📞 Need immediate assistance?</strong></p>
            <p>For urgent matters, you can contact our support team directly:</p>
            <ul>
              <li>Email: support@smartskillz.com</li>
              <li>Phone: +1 (555) 123-4567</li>
            </ul>

            <p>We appreciate your patience and will resolve this matter as quickly as possible.</p>

            <p>Best regards,<br>
            <strong>The SmartSkillz Admin Team</strong></p>
          </div>

          <div class="footer">
            <p>This is an automated response. Please do not reply to this email.</p>
            <p>For immediate assistance, contact us at support@smartskillz.com</p>
            <p>Request Reference: ${requestData.walletId}-${Date.now()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate plain text auto-reply for wallet activation user
  private static generateWalletActivationUserText(requestData: WalletActivationRequestData): string {
    return `
Wallet Activation Request Received - SmartSkillz

Dear ${requestData.userName},

Thank you for submitting your wallet activation request. We have received your request and our admin team will review it promptly.

Request Summary:
- Request Type: Wallet Activation
- Priority Level: ${requestData.priority.charAt(0).toUpperCase() + requestData.priority.slice(1)}
- Reason: ${this.getReasonLabel(requestData.reason)}
- Submitted: ${new Date(requestData.timestamp).toLocaleString()}

What happens next?
- Review Process: Our admin team will review your request within 24-48 hours
- Priority Handling: ${requestData.priority === 'high' ? 'High priority requests are reviewed within 12 hours' : requestData.priority === 'medium' ? 'Medium priority requests are reviewed within 24 hours' : 'Low priority requests are reviewed within 48 hours'}
- Email Updates: You'll receive email notifications about the status of your request
- Wallet Activation: Once approved, your wallet will be reactivated automatically

Need immediate assistance?
For urgent matters, contact our support team:
- Email: support@smartskillz.com
- Phone: +1 (555) 123-4567

We appreciate your patience and will resolve this matter as quickly as possible.

Best regards,
The SmartSkillz Admin Team

---
This is an automated response. Please do not reply to this email.
For immediate assistance, contact us at support@smartskillz.com
Request Reference: ${requestData.walletId}-${Date.now()}
    `;
  }
}
