import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

export const sendInvitationEmail = async (to: string, salonName: string, invitationLink: string) => {
  console.log("Configuration email:", {
    mailUser: process.env.MAIL_USER ? "Configuré" : "Non configuré",
    mailPassword: process.env.MAIL_PASSWORD ? "Configuré" : "Non configuré",
    sendgridApiKey: process.env.SENDGRID_API_KEY ? "Configuré" : "Non configuré"
  });

  console.log("Valeurs exactes (masquées):", {
    mailUser: process.env.MAIL_USER,
    mailPassword: process.env.MAIL_PASSWORD ? "***" : undefined,
    sendgridApiKey: process.env.SENDGRID_API_KEY ? "***" : undefined
  });

  // Utiliser Gmail directement
  if (process.env.MAIL_USER && process.env.MAIL_PASSWORD) {
    console.log("Tentative d'envoi d'email avec Gmail...");
    
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false // Ignorer la vérification du certificat
        }
      });

      const mailOptions = {
        from: `"LearninG" <${process.env.MAIL_USER}>`,
        to,
        subject: `🎉 Invitation à rejoindre le salon "${salonName}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #4a6ee0;">Invitation à rejoindre un salon</h2>
            <p>Bonjour,</p>
            <p>Vous êtes invité(e) à rejoindre le salon <strong>${salonName}</strong> sur la plateforme LearninG.</p>
            <p style="margin: 25px 0;">
              <a href="${invitationLink}" style="background-color: #4a6ee0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Accéder au salon
              </a>
            </p>
            <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #666;">${invitationLink}</p>
            <p>À bientôt sur LearninG !</p>
          </div>
        `
      };

      console.log("Envoi de l'email avec Gmail...");
      await transporter.sendMail(mailOptions);
      console.log("Email envoyé avec succès via Gmail!");
      return { success: true, message: `Email envoyé à ${to} avec succès!` };
    } catch (error) {
      console.error("Erreur lors de l'envoi via Gmail:", error);
      // Si Gmail échoue, on continue avec les autres méthodes
    }
  } 
  
  // Si SendGrid est configuré
  if (process.env.SENDGRID_API_KEY) {
    console.log("Tentative d'envoi d'email avec SendGrid...");
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'hejer.zouaoui1215@gmail.com', // Assurez-vous que cette adresse est vérifiée dans SendGrid
        subject: `Invitation à rejoindre le salon "${salonName}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #4a6ee0;">Invitation à rejoindre un salon</h2>
            <p>Bonjour,</p>
            <p>Vous êtes invité(e) à rejoindre le salon <strong>${salonName}</strong> sur la plateforme LearninG.</p>
            <p style="margin: 25px 0;">
              <a href="${invitationLink}" style="background-color: #4a6ee0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Accéder au salon
              </a>
            </p>
            <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #666;">${invitationLink}</p>
            <p>À bientôt sur LearninG !</p>
          </div>
        `
      };
      
      console.log("Envoi de l'email avec SendGrid...");
      console.log("Détails de l'envoi:", {
        to,
        from: msg.from,
        subject: msg.subject
      });
      
      await sgMail.send(msg);
      console.log("Email envoyé avec succès via SendGrid!");
      return { success: true, message: `Email envoyé à ${to} avec succès via SendGrid!` };
    } catch (error) {
      console.error("Erreur lors de l'envoi via SendGrid:", error);
      if (error instanceof Error && 'response' in error && error.response && 
          typeof error.response === 'object' && error.response !== null && 
          'body' in error.response && typeof (error.response as any).body === 'object' && (error.response as any).body !== null && 'errors' in (error.response as any).body) {
        console.error("Détails de l'erreur SendGrid:", (error.response as any).body.errors);
      }
      // Si SendGrid échoue, on continue avec Mailjet
    }
  } 
  
  // Si Mailjet est configuré
  if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) {
    console.log("Tentative d'envoi d'email avec Mailjet...");
    try {
      const transporter = nodemailer.createTransport({
        host: 'in-v3.mailjet.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAILJET_API_KEY,
          pass: process.env.MAILJET_SECRET_KEY
        }
      });

      const mailOptions = {
        from: `"LearninG" <${process.env.MAIL_USER || 'no-reply@learning.com'}>`,
        to,
        subject: `Invitation à rejoindre le salon "${salonName}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #4a6ee0;">Invitation à rejoindre un salon</h2>
            <p>Bonjour,</p>
            <p>Vous êtes invité(e) à rejoindre le salon <strong>${salonName}</strong> sur la plateforme LearninG.</p>
            <p style="margin: 25px 0;">
              <a href="${invitationLink}" style="background-color: #4a6ee0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Accéder au salon
              </a>
            </p>
            <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #666;">${invitationLink}</p>
            <p>À bientôt sur LearninG !</p>
          </div>
        `
      };

      console.log("Envoi de l'email avec Mailjet...");
      await transporter.sendMail(mailOptions);
      console.log("Email envoyé avec succès via Mailjet!");
      return { success: true, message: `Email envoyé à ${to} avec succès via Mailjet!` };
    } catch (error) {
      console.error("Erreur lors de l'envoi via Mailjet:", error);
      // Si Mailjet échoue, on continue avec Ethereal
    }
  }
  
  // Utiliser Ethereal pour les tests en dernier recours
  console.log("Utilisation d'Ethereal pour le test...");
  const testAccount = await nodemailer.createTestAccount();
  
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: '"LearninG Test" <test@example.com>',
    to,
    subject: `Invitation à rejoindre le salon "${salonName}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a6ee0;">Invitation à rejoindre un salon</h2>
        <p>Bonjour,</p>
        <p>Vous êtes invité(e) à rejoindre le salon <strong>${salonName}</strong> sur la plateforme LearninG.</p>
        <p style="margin: 25px 0;">
          <a href="${invitationLink}" style="background-color: #4a6ee0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Accéder au salon
          </a>
        </p>
        <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
        <p style="word-break: break-all; color: #666;">${invitationLink}</p>
        <p>À bientôt sur LearninG !</p>
      </div>
    `
  };

  console.log("Envoi de l'email avec Ethereal...");
  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log("Email de test envoyé avec Ethereal, URL de prévisualisation:", previewUrl);
  
  return { 
    success: true, 
    testMode: true,
    previewUrl
  };
};
