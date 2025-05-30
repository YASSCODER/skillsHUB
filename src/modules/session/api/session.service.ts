import { isValidObjectId } from "mongoose";
import Session, { SessionDocument } from "../../../common/models/session.schema";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";
import Salon from "../../../common/models/salon.schema";
import mongoose from "mongoose";
import { CalendarService } from "../../salon/api/calendar.service";

dayjs.extend(customParseFormat);

export class SessionService {
  // Créer une session (SANS calendrier, gestion robuste des dates)
  async createSession(salonId: string, data: Partial<SessionDocument>): Promise<any> {
    try {
      // Gestion de dateDebut
      let dateDebut: Date | undefined = undefined;
      if (typeof data.dateDebut === "string") {
        // Essaie d'abord le format "DD/MM/YYYY HH:mm", sinon ISO, sinon lève une erreur
        const parsed = dayjs(data.dateDebut, "DD/MM/YYYY HH:mm", true);
        if (!parsed.isValid()) throw new Error("Format de dateDebut invalide");
        dateDebut = parsed.toDate();
      } else if (data.dateDebut instanceof Date) {
        dateDebut = data.dateDebut;
      }

      // Gestion de dateFin
      let dateFin: Date | undefined = undefined;
      if (typeof data.dateFin === "string") {
        const parsed = dayjs(data.dateFin, "DD/MM/YYYY HH:mm", true);
        if (!parsed.isValid()) throw new Error("Format de dateFin invalide");
        dateFin = parsed.toDate();
      } else if (data.dateFin instanceof Date) {
        dateFin = data.dateFin;
      }

      // Vérifications finales
      if (!dateDebut || !dateFin) throw new Error("dateDebut ou dateFin non fournie");
      if (dateFin <= dateDebut) throw new Error("La date de fin doit être après la date de début");

      // Création de la session
      const newSession = new Session({
        salonId,
        type: data.type,
        dateDebut,
        dateFin,
        createurNom: data.createurNom,
        etat: data.etat || "en attente"
      });

      const saved = await newSession.save();
      return {
        id: saved._id,
        type: saved.type,
        dateDebut: saved.dateDebut,
        dateFin: saved.dateFin,
        createurNom: saved.createurNom,
        etat: saved.etat,
        salonId: saved.salonId
      };
    } catch (error) {
      console.error("Erreur dans createSession:", error);
      throw error;
    }
  }

  // Trouver les sessions par utilisateur
  async findSessionsByUser(userId: string): Promise<SessionDocument[]> {
    return await Session.find({ createurId: userId }).exec();
  }

  async getAllSessions(): Promise<any[]> {
    const sessions = await Session.find()
      .select('_id type dateDebut dateFin createurNom etat salonId') // Inclure createurNom
      .populate('salonId', 'nom') // Joindre le nom du salon
      .exec();
  
    console.log('Sessions Renvoyées :', sessions); // Log pour vérifier
    return sessions;
  }

  // Récupérer une session par ID
  async getSessionById(id: string): Promise<SessionDocument | null> {
    return await Session.findById(id).exec();
  }

  async updateSession(id: string, updateData: Partial<SessionDocument>): Promise<SessionDocument | null> {
    console.log("Mise à jour de la session avec l'ID :", id);
    console.log("Données à mettre à jour :", updateData);

    try {
      // Vérifier si les dates sont valides avant la mise à jour
      if (updateData.dateDebut && updateData.dateFin) {
        const dateDebut = new Date(updateData.dateDebut);
        const dateFin = new Date(updateData.dateFin);
        
        if (dateFin <= dateDebut) {
          throw new Error("La date de fin doit être après la date de début");
        }
      } else if (updateData.dateDebut || updateData.dateFin) {
        // Si une seule date est fournie, récupérer l'autre depuis la base de données
        const existingSession = await Session.findById(id);
        if (!existingSession) {
          return null;
        }
        
        const dateDebut = updateData.dateDebut ? new Date(updateData.dateDebut) : existingSession.dateDebut;
        const dateFin = updateData.dateFin ? new Date(updateData.dateFin) : existingSession.dateFin;
        
        if (dateFin <= dateDebut) {
          throw new Error("La date de fin doit être après la date de début");
        }
      }

      // Utiliser findByIdAndUpdate avec runValidators: false pour éviter les problèmes de validation
      const updatedSession = await Session.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: false }
      );

      if (!updatedSession) {
        console.log("Session introuvable pour l'ID :", id);
        return null;
      }

      console.log("Session mise à jour avec succès :", updatedSession);
      return updatedSession;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la session :", error);
      throw error;
    }
  }
  
 // Supprimer une session
 async deleteSession(id: string): Promise<SessionDocument | null> {
  return await Session.findByIdAndDelete(id); // Supprimer la session par ID
}


  // Compter les sessions par salon
  async countSessionsBySalon(salonId: string): Promise<number> {
    return await Session.countDocuments({ salonId });
  }

  // Récupérer les sessions par type (chat ou meet)
  async getSessionsByType(type: "chat" | "meet"): Promise<SessionDocument[]> {
    return await Session.find({ type }).exec();
  }

  // Calculer la durée moyenne des sessions
  async getAverageSessionDuration(): Promise<number> {
    const result = await Session.aggregate([
      {
        $project: {
          durationInMinutes: {
            $divide: [
              { $subtract: ["$dateFin", "$dateDebut"] },
              1000 * 60 // Convertir la durée en minutes
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: "$durationInMinutes" }
        }
      }
    ]);

    return result.length > 0 ? result[0].averageDuration : 0;
  }

  // Trouver les sessions par salon
  async findSessionsBySalon(salonId: string): Promise<SessionDocument[]> {
    return await Session.find({ salonId }).exec();
  }

  // Créer plusieurs sessions
  async createMultipleSessions(data: Partial<SessionDocument>[]): Promise<SessionDocument[]> {
    try {
      // Nettoyer les données pour éviter les conflits avec _id
      const cleanedData = data.map(({ _id, ...rest }) => rest);
      return await Session.insertMany(cleanedData, { ordered: false });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Erreur dans createMultipleSessions:", error.stack || error.message);
      } else {
        console.error("Erreur inconnue dans createMultipleSessions:", error);
      }
      throw error;
    }
  }
  // Récupérer les sessions par compétence
  async getSessionsBySkill(skillId: string): Promise<SessionDocument[]> {
    if (!isValidObjectId(skillId)) {
      throw new Error("ID de compétence invalide");
    }
    return await Session.find({ skillId }).exec();
  }

  // Récupérer les sessions par salon et compétence
  async getSessionsBySalonAndSkill(salonId: string, skillId: string): Promise<SessionDocument[]> {
    if (!isValidObjectId(salonId) || !isValidObjectId(skillId)) {
      throw new Error("ID de salon ou de compétence invalide");
    }
    return await Session.find({ salonId, skillId }).exec();
  }

  // Recherche avancée de sessions avec filtres
  async advancedSearch(filters: any): Promise<SessionDocument[]> {
    try {
      const query: any = {};
      
      // Appliquer les filtres si présents
      if (filters.type) {
        query.type = filters.type;
      }
      
      if (filters.etat) {
        query.etat = filters.etat;
      }
      
      if (filters.createurNom) {
        query.createurNom = { $regex: new RegExp(filters.createurNom, 'i') };
      }
      
      if (filters.salonId) {
        query.salonId = filters.salonId;
      }
      
      // Filtres de date
      if (filters.dateDebut || filters.dateFin) {
        query.dateDebut = {};
        
        if (filters.dateDebut) {
          query.dateDebut.$gte = new Date(filters.dateDebut);
        }
        
        if (filters.dateFin) {
          query.dateFin = { $lte: new Date(filters.dateFin) };
        }
      }
      
      return await Session.find(query)
        .populate('salonId', 'nom')
        .sort({ dateDebut: 1 })
        .exec();
    } catch (error) {
      console.error("Erreur dans advancedSearch:", error);
      throw error;
    }
  }
    async getSessionsBySalonNom(salonNom: string): Promise<SessionDocument[]> {
    // Trouver le salon par son nom
    const salon = await Salon.findOne({ nom: salonNom });
    if (!salon) throw new Error('Salon introuvable');

    // Trouver les sessions liées au salon
    return Session.find({ salonId: salon._id });
  }
}
