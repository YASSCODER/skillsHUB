import Salon from '../../../common/models/salon.schema';
import catchAsync from '../../../common/utils/catch-async.utils';
import { sendInvitationEmail } from './mail.service';
import { Request, Response } from "express";

export const inviterUtilisateur = catchAsync(async (req: Request, res: Response) => {
  const { email, emails, salonId } = req.body;
  
  // Déterminer si on utilise un email unique ou un tableau d'emails
  let emailsToInvite = [];
  
  if (email) {
    // Si un email unique est fourni
    emailsToInvite.push(email);
  } else if (emails && Array.isArray(emails)) {
    // Si un tableau d'emails est fourni
    emailsToInvite = emails;
  } else {
    return res.status(400).json({ message: 'Veuillez fournir au moins un email valide.' });
  }

  // Récupérer salon
  const salon = await Salon.findById(salonId);
  if (!salon) {
    return res.status(404).json({ message: 'Salon introuvable.' });
  }

  const invitationLink = `http://localhost:4200/salons/${salonId}/invitation`;
  const results = [];

  // Envoyer des invitations à tous les emails
  for (const emailAddress of emailsToInvite) {
    try {
      const result = await sendInvitationEmail(emailAddress, salon.nom, invitationLink);
      results.push({ email: emailAddress, success: true, ...result });
    } catch (error) {
      results.push({ email: emailAddress, success: false, error: error.message });
    }
  }

  // Adapter le message selon le nombre d'invitations
  const message = emailsToInvite.length > 1 
    ? `${results.filter(r => r.success).length}/${emailsToInvite.length} invitations envoyées avec succès.`
    : results[0].success 
      ? `Invitation envoyée à ${emailsToInvite[0]} avec succès.`
      : `Échec de l'envoi à ${emailsToInvite[0]}.`;

  return res.status(200).json({ 
    message,
    results
  });
});
