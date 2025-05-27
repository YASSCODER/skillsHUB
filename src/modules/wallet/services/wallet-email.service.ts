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
    const subject = `🎉 Wallet Top-Up Successful - ${data.packageName} Package`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6A00F4; margin: 0; font-size: 28px;">🎉 Top-Up Successful!</h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase</p>
        </div>

        <!-- Main Content -->
        <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${data.userName}!</h2>

          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            Your wallet has been successfully topped up! Here are the details of your transaction:
          </p>

          <!-- Transaction Details -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #6A00F4; margin-top: 0; margin-bottom: 15px;">📦 Transaction Details</h3>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Package:</td>
                <td style="padding: 8px 0; color: #333;">${data.packageName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Amount Paid:</td>
                <td style="padding: 8px 0; color: #333;">$${data.amountPaid}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">iMoney Received:</td>
                <td style="padding: 8px 0; color: #00CFFF; font-weight: bold; font-size: 18px;">${data.imoneyReceived} iMoney</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">New Balance:</td>
                <td style="padding: 8px 0; color: #28a745; font-weight: bold; font-size: 18px;">${data.newBalance} iMoney</td>
              </tr>
              ${data.transactionId ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Transaction ID:</td>
                <td style="padding: 8px 0; color: #666; font-size: 12px;">${data.transactionId}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- What's Next -->
          <div style="background-color: #e8f4fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #0066cc; margin-top: 0; margin-bottom: 15px;">🚀 What's Next?</h3>
            <p style="color: #333; margin: 0; line-height: 1.6;">
              You can now use your iMoney to:
            </p>
            <ul style="color: #333; margin: 10px 0; padding-left: 20px;">
              <li>Purchase premium challenges</li>
              <li>Unlock exclusive skills</li>
              <li>Access advanced learning content</li>
            </ul>
          </div>

          <!-- Thank You Message -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <h3 style="color: #6A00F4; margin-bottom: 10px;">Thank You! 💜</h3>
            <p style="color: #666; margin: 0; line-height: 1.6;">
              We appreciate your trust in our platform. Happy learning!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #999; font-size: 14px; margin-top: 20px;">
          <p style="margin: 0;">
            This is an automated message from SkillsHUB.<br>
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `;

    return { subject, html };
  }
}
