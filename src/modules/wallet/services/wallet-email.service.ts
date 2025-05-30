import nodemailer from 'nodemailer';

interface TopUpEmailData {
  userEmail: string;
  userName: string;
  packageName: string;
  amountPaid: number;
  imoneyReceived: number;
  newBalance: number;
  transactionId?: string;
}

export class WalletEmailService {

  // Send top-up confirmation email using the same method as auth service
  static async sendTopUpConfirmationEmail(data: TopUpEmailData) {
    console.log("=== SENDING TOP-UP CONFIRMATION EMAIL ===");
    console.log("Email data:", data);

    // Use the same transporter setup as auth service
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailTemplate = this.generateTopUpEmailTemplate(data);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    console.log("Sending email with options:", {
      from: process.env.EMAIL_USER,
      to: data.userEmail,
      subject: emailTemplate.subject,
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS,
    });

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
          console.error("Error sending top-up confirmation email:", error);
          reject(error);
        } else {
          console.log("Top-up confirmation email sent successfully:", info.response);
          resolve({
            success: true,
            provider: 'Gmail',
            messageId: info.messageId,
            response: info.response
          });
        }
      });
    });
  }

  // Generate email template for top-up confirmation
  private static generateTopUpEmailTemplate(data: TopUpEmailData) {
    const subject = `🎉 SmartSkillz Wallet Top-Up Successful - ${data.packageName}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Wallet Top-Up Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .logo { height: 60px; width: auto; margin-bottom: 15px; }
          .brand-name { font-size: 28px; font-weight: bold; margin: 10px 0; }
          .success-icon { font-size: 48px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header with Logo and Branding -->
          <div class="header">
            <div class="brand-name" style="font-size: 28px; font-weight: bold; margin: 10px 0; color: white;">SmartSkillz</div>
            <div class="success-icon" style="font-size: 48px; margin: 15px 0;">🎉</div>
            <h1 style="margin: 0; font-size: 24px; color: white;">Wallet Top-Up Successful!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; color: #E0F2FE;">Thank you for your purchase</p>
          </div>

          <!-- Main Content -->
          <div class="content">
            <h2 style="color: #333; margin-top: 0; font-size: 22px;">Hello ${data.userName}! 👋</h2>

            <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 25px;">
              Your SmartSkillz wallet has been successfully topped up! Here are the details of your transaction:
            </p>

            <!-- Transaction Details -->
            <div style="background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #3B82F6;">
              <h3 style="color: #3B82F6; margin-top: 0; margin-bottom: 20px; font-size: 18px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">📦</span> Transaction Details
              </h3>

              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                  <td style="padding: 12px 0; color: #666; font-weight: 600; border-bottom: 1px solid #E0F2FE;">📦 Package:</td>
                  <td style="padding: 12px 0; color: #333; font-weight: 600; border-bottom: 1px solid #E0F2FE;">${data.packageName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #666; font-weight: 600; border-bottom: 1px solid #E0F2FE;">💳 Amount Paid:</td>
                  <td style="padding: 12px 0; color: #333; font-weight: bold; font-size: 16px; border-bottom: 1px solid #E0F2FE;">$${data.amountPaid}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #666; font-weight: 600; border-bottom: 1px solid #E0F2FE;">💰 iMoney Received:</td>
                  <td style="padding: 12px 0; color: #3B82F6; font-weight: bold; font-size: 18px; border-bottom: 1px solid #E0F2FE;">${data.imoneyReceived} iMoney</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #666; font-weight: 600;">🏦 New Wallet Balance:</td>
                  <td style="padding: 12px 0; color: #10B981; font-weight: bold; font-size: 18px;">${data.newBalance} iMoney</td>
                </tr>
                ${data.transactionId ? `
                <tr>
                  <td style="padding: 12px 0; color: #666; font-weight: 600; border-top: 1px solid #E0F2FE;">🔗 Transaction ID:</td>
                  <td style="padding: 12px 0; color: #666; font-family: monospace; font-size: 14px; border-top: 1px solid #E0F2FE;">${data.transactionId}</td>
                </tr>
                ` : ''}
              </table>
          </div>

            <!-- What's Next -->
            <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #10B981;">
              <h3 style="color: #10B981; margin-top: 0; margin-bottom: 15px; font-size: 18px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">🚀</span> What's Next?
              </h3>
              <p style="color: #333; margin: 0 0 15px 0; line-height: 1.6; font-size: 16px;">
                You can now use your iMoney to unlock amazing learning opportunities:
              </p>
              <ul style="color: #333; margin: 0; padding-left: 25px; line-height: 1.8;">
                <li><strong>🏆 Premium Challenges</strong> - Test your skills with advanced challenges</li>
                <li><strong>🎯 Exclusive Skills</strong> - Access expert-level courses and tutorials</li>
              </ul>
            </div>

            <!-- Thank You Message -->
            <div style="text-align: center; margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #FEF3F2 0%, #FEE2E2 100%); border-radius: 10px; border-left: 4px solid #EF4444;">
              <h3 style="color: #EF4444; margin-bottom: 15px; font-size: 20px;">Thank You! ❤️</h3>
              <p style="color: #666; margin: 0; line-height: 1.6; font-size: 16px;">
                We appreciate your trust in <strong>SmartSkillz</strong>. Your investment in learning will unlock endless possibilities!
              </p>
              <p style="color: #666; margin: 15px 0 0 0; font-style: italic;">
                Happy learning and skill building! 🌟
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; color: #999; font-size: 14px; margin-top: 30px; padding: 20px; background: #F9FAFB; border-radius: 10px;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #666;">
              This is an automated message from <strong>SmartSkillz</strong>
            </p>
            <p style="margin: 0; line-height: 1.5;">
              If you have any questions, please contact our support team at<br>
              <a href="mailto:support@smartskillz.com" style="color: #3B82F6; text-decoration: none;">support@smartskillz.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }
}
