import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'samaalichayma99@gmail.com',
    pass: 'cgkm jygb xxdr uuji',
  },
});

export async function sendCertificateEmail(to: string, name: string) {
  const mailOptions = {
    from: '"SmartSkillz 👩‍🏫" <samaalichayma99@gmail.com>',
    to,
    subject: '🎉 Bravo ! Vous avez obtenu un certificat !',
    html: `
      <h2>Félicitations ${name} 🎉</h2>
      <p>Vous avez atteint <strong>1000%</strong> de progression sur la plateforme SmartSkillz.</p>
      <p>Vous avez débloqué un <strong>Certificat d'excellence</strong> !</p>
      <img src="https://ui-avatars.com/api/?name=Certificat&background=ffcc00&color=000&bold=true&format=png" />
    `,
  };

  await transporter.sendMail(mailOptions);
}
