import { Request, Response } from "express";
import { SalonService } from "./salon.service";
import { SessionService } from "../../session/api/session.service";
import Salon from "../../../common/models/salon.schema";
import Session from "../../../common/models/session.schema";
import Notification from "../../../common/models/notification.schema";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
const salonService = new SalonService();
const sessionService = new SessionService();

export class SalonController {
  private salonService: SalonService;

  constructor() {
    this.salonService = new SalonService();
  }

  async createSalon(req: Request, res: Response) {
    try {
      const salon = await salonService.createSalon(req.body);

      // --- AJOUT NOTIFICATION ---
      if (salon && salon.createurId) {
        await Notification.create({
          userId: salon.createurId, // adapte selon ta structure (peut-être req.body.createurId)
          message: `Le salon "${salon.nom}" a été créé avec succès.`,
          date: new Date(),
          lu: false
        });
      }
      // --- FIN AJOUT NOTIFICATION ---

      res.status(201).json(salon);
    } catch (error: any) {
      console.error("Erreur création salon :", error.message);
      res.status(400).json({ error: error.message });
    }
  }
  async getAllSalons(req: Request, res: Response) {
    try {
      const salons = await salonService.getAllSalons();
      res.status(200).json(salons);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des salons" });
    }
  }
 // Récupérer les salons avec leurs sessions associées
  async getSalonsWithSessions(req: Request, res: Response): Promise<Response> {
    try {
      // Récupérer tous les salons
      const salons = await Salon.find();

      // Préparer un tableau pour stocker les salons avec leurs sessions associées
      const salonsWithSessions = await Promise.all(
        salons.map(async (salon) => {
          const sessions = await Session.find({ salonId: salon._id }); // Récupérer les sessions associées
          return {
            salon: {
              id: salon._id,
              nom: salon.nom,
              description: salon.description,
              dateCreation: salon.dateCreation,
              createurId: salon.createurId,
            },
            sessions: sessions.map((session) => ({
              id: session._id,
              type: session.type,
              dateDebut: session.dateDebut,
              dateFin: session.dateFin,
              etat: session.etat,
              createurNom: session.createurNom,
            })),
          };
        })
      );

      return res.status(200).json(salonsWithSessions); // Retourner les salons avec leurs sessions
    } catch (error) {
      console.error("Erreur lors de la récupération des salons et sessions :", error);
      return res.status(500).json({ error: "Erreur lors de la récupération des salons et sessions" });
    }
  }
 
 

  async getSalonById(req: Request, res: Response) {
    try {
      const salon = await salonService.getSalonById(req.params.id);
      if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
      res.status(200).json(salon);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération du salon" });
    }
  }

  async getSalonByName(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const salons = await salonService.findByNom(decodeURIComponent(name));
      if (!salons || salons.length === 0) {
        return res.status(404).json({ error: "Aucun salon trouvé avec ce nom" });
      }
      res.status(200).json(salons); // maintenant on renvoie un tableau ✅
    } catch (error) {
      console.error("Erreur :", error);
      res.status(500).json({ error: "Erreur lors de la récupération du salon par nom" });
    }
  }

  async updateSalonByName(req: Request, res: Response) {
    try {
      const { name } = req.params;
  
      console.log("Nom du salon à mettre à jour :", name);
  
      if (!name) {
        return res.status(400).json({ error: "Nom du salon manquant" });
      }
  
      // Supprimez explicitement le champ 'nom' du corps de la requête
      if (req.body.nom) {
        delete req.body.nom;
      }
  
      const updatedSalon = await salonService.findByNom(name);
      if (updatedSalon) {
        Object.assign(updatedSalon, req.body);
        await updatedSalon.save();
      }
  
      if (!updatedSalon) {
        return res.status(404).json({ error: "Salon non trouvé" });
      }
  
      console.log("Salon mis à jour avec succès :", updatedSalon);
      res.status(200).json(updatedSalon);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      res.status(500).json({ error: "Erreur lors de la mise à jour du salon" });
    }
  }
  
  async deleteSalon(req: Request, res: Response) {
    try {
      const { name } = req.params; // On récupère le nom du salon
      const salon = await salonService.findByNom(name);
      if (salon) {
        await salon.deleteOne();
      }
      if (!salon) {
        return res.status(404).json({ error: "Salon non trouvé" });
      }
      res.status(200).json({ message: "Salon supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression du salon" });
    }
  }
  
  async existsSalonByName(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const exists = await salonService.findByNom(name) !== null;
      res.status(200).json({ exists });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la vérification du salon" });
    }
  }


   async inviterParticipant(req: Request, res: Response) {
    try {
      const { email, salonId } = req.body;

      // Récupérer le salon (pour le nom, etc)
      const salon = await Salon.findById(salonId);
      if (!salon) return res.status(404).json({ error: "Salon non trouvé" });

      // Générer un lien d'invitation (ajuste selon ta logique)
      const invitationLink = `https://tonapp.com/invitation?salon=${salonId}&email=${encodeURIComponent(email)}`;

      // Générer le QR code en base64
      const qrCodeDataUrl = await QRCode.toDataURL(invitationLink);

      // Création d’un compte SMTP de test Ethereal (pas besoin d'email réel)
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
    rejectUnauthorized: false, // << AJOUTE CETTE LIGNE
  },
});

      const htmlContent = `
        <div style="font-family:Arial,sans-serif;">
          <h2 style="color:#5b6ee1;">Invitation au salon <span>${salon.nom}</span></h2>
          <p>Bonjour,<br>Vous êtes invité à participer au salon <b>${salon.nom}</b>.</p>
          <p>Scannez ce QR code pour rejoindre le salon :</p>
          <img src="${qrCodeDataUrl}" alt="QR Code" style="width:150px; height:150px; margin:16px 0;" />
          <p>Ou cliquez ici : <a href="${invitationLink}">${invitationLink}</a></p>
          <p style="color:#8fa6fa;">À bientôt sur notre plateforme !</p>
        </div>
      `;

      // Envoi du mail
      const info = await transporter.sendMail({
        from: '"MonApp Salons" <no-reply@ethereal.email>',
        to: email,
        subject: `Invitation à participer au salon "${salon.nom}"`,
        html: htmlContent,
      });

      // Lien d’aperçu Ethereal (affiché dans la réponse API)
      res.json({
        message: "Invitation envoyée avec succès (test Ethereal) !",
        etherealPreview: nodemailer.getTestMessageUrl(info),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de l'envoi de l'invitation." });
    }
  }


  async getUserLeaderboard(req: Request, res: Response) {
    try {
      const leaderboard = await this.salonService.getUserLeaderboard();
      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération du leaderboard" });
    }  }

     /**
   * Recherche multi-critères sur les salons
   * Query params acceptés : nom, description, createurNom, dateMin, dateMax, etat, etc.
   */
  async searchSalons(req: Request, res: Response) {
    try {
      console.log("Requête de recherche reçue:", req.query);
      
      const { nom } = req.query;
      const filter: any = {};
      
      if (nom && typeof nom === 'string') {
        try {
          // Utiliser une expression régulière insensible à la casse
          // Échapper les caractères spéciaux pour éviter les erreurs RegExp
          const escapedNom = nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          filter.nom = { $regex: escapedNom, $options: "i" };
        } catch (regexError) {
          console.error("Erreur lors de la création de l'expression régulière:", regexError);
          // En cas d'erreur avec l'expression régulière, utiliser une recherche simple
          filter.nom = nom;
        }
      }

      console.log("Recherche de salons avec filtre:", filter);
      
      const salons = await Salon.find(filter).exec();
      console.log(`${salons.length} salons trouvés`);
      
      return res.status(200).json(salons);
    } catch (err: any) {
      console.error("Erreur recherche salons :", err);
      return res.status(500).json({ 
        error: "Erreur lors de la recherche des salons", 
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }

  // Nouvelle méthode pour récupérer les salons par compétence
  async getSalonsBySkill(req: Request, res: Response) {
    const { skillId } = req.params;
    
    try {
      const salons = await this.salonService.getSalonsBySkill(skillId);
      return res.status(200).json(salons);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // Nouvelle méthode pour récupérer les salons avec sessions par compétence
  async getSalonsWithSessionsBySkill(req: Request, res: Response) {
    const { skillId } = req.params;
    
    try {
      const salons = await this.salonService.getSalonsWithSessionsBySkill(skillId);
      return res.status(200).json(salons);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

