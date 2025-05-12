import Session, { SessionDocument } from "../../../common/models/session.schema";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export class SessionService {
  // Créer une session
  async createSession(salonId: string, data: Partial<SessionDocument>): Promise<any> {
    const format = "DD/MM/YYYY HH:mm";

    // Validation des dates
    if (!data.dateDebut || !data.dateFin) {
      throw new Error("Les dates de début et de fin sont requises au format 'JJ/MM/AAAA HH:mm'");
    }

    const dateDebut = dayjs(data.dateDebut, format, true);
    const dateFin = dayjs(data.dateFin, format, true);
    const now = dayjs();

    if (!dateDebut.isValid() || !dateFin.isValid()) {
      throw new Error("Le format des dates est invalide. Utilisez 'JJ/MM/AAAA HH:mm'");
    }

    if (dateDebut.isBefore(now, "minute")) {
      throw new Error("La date de début doit être aujourd'hui ou plus tard");
    }

    if (!dateFin.isAfter(dateDebut)) {
      throw new Error("La date de fin doit être après la date de début");
    }

    // Création de la session
    const session = new Session({
      ...data,
      salonId, // ID du salon associé
      dateDebut: dateDebut.toDate(),
      dateFin: dateFin.toDate(),
      createurNom: data.createurNom,
    });

    const saved = await session.save();

    return {
      id: saved._id,
      type: saved.type,
      dateDebut: dayjs(saved.dateDebut).format(format),
      dateFin: dayjs(saved.dateFin).format(format),
      createurNom: saved.createurNom,
      etat: saved.etat,
    };
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
}
