import mongoose from "mongoose";
import CalendarEvent from "../../../common/models/calendar-event.schema";
import Session from "../../../common/models/session.schema";
import Salon from "../../../common/models/salon.schema";

export class CalendarService {
  // Récupérer tous les événements pour un salon
  async getEventsBySalon(salonId: string): Promise<any[]> {
    try {
      console.log(`Service: Recherche d'événements pour le salon ${salonId}`);
      
      // Vérifiez si le salon existe
      const salonExists = await Salon.exists({ _id: salonId });
      if (!salonExists) {
        console.log(`Service: Salon ${salonId} non trouvé`);
        return [];
      }
      
      const events = await CalendarEvent.find({ salonId })
        .populate("createdBy", "nom prenom email")
        .populate("sessionId", "type etat");
      
      console.log(`Service: ${events.length} événements trouvés pour le salon ${salonId}`);
      return events;
    } catch (error) {
      console.error("Erreur détaillée dans getEventsBySalon:", error);
      throw error;
    }
  }

  // Récupérer tous les événements pour un utilisateur (tous les salons)
  async getEventsByUser(userId: string): Promise<any[]> {
    // Trouver tous les salons où l'utilisateur est membre ou créateur
    const salons = await Salon.find({
      $or: [
        { createurId: userId },
        { members: userId }
      ]
    });
    
    const salonIds = salons.map(salon => salon._id);
    
    // Trouver tous les événements pour ces salons
    return await CalendarEvent.find({
      $or: [
        { salonId: { $in: salonIds } },
        { attendees: userId }
      ]
    })
    .populate("salonId", "nom")
    .populate("sessionId", "type")
    .populate("createdBy", "nom prenom");
  }

  // Créer un nouvel événement
  async createEvent(eventData: any): Promise<any> {
    // Vérifier si l'événement est lié à une session
    if (eventData.sessionId) {
      const session = await Session.findById(eventData.sessionId);
      if (!session) {
        throw new Error("Session non trouvée");
      }
      
      // Synchroniser les dates avec la session
      eventData.start = session.dateDebut;
      eventData.end = session.dateFin;
    }
    
    return await CalendarEvent.create(eventData);
  }

  // Mettre à jour un événement
  async updateEvent(eventId: string, eventData: any): Promise<any> {
    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      throw new Error("Événement non trouvé");
    }
    
    // Si l'événement est lié à une session, mettre à jour la session également
    if (event.sessionId) {
      await Session.findByIdAndUpdate(event.sessionId, {
        dateDebut: eventData.start,
        dateFin: eventData.end
      });
    }
    
    return await CalendarEvent.findByIdAndUpdate(eventId, eventData, { new: true });
  }

  // Supprimer un événement
  async deleteEvent(eventId: string): Promise<any> {
    return await CalendarEvent.findByIdAndDelete(eventId);
  }

  // Créer des événements récurrents
  async createRecurringEvents(eventData: any): Promise<any[]> {
    if (!eventData.recurrence) {
      throw new Error("Données de récurrence manquantes");
    }
    
    const { frequency, interval, endDate } = eventData.recurrence;
    const startDate = new Date(eventData.start);
    const endRecurrenceDate = endDate ? new Date(endDate) : new Date(startDate);
    endRecurrenceDate.setMonth(endRecurrenceDate.getMonth() + 3); // Limite à 3 mois si pas de date de fin
    
    const events = [];
    let currentDate = new Date(startDate);
    const eventDuration = new Date(eventData.end).getTime() - new Date(eventData.start).getTime();
    
    while (currentDate <= endRecurrenceDate) {
      const newEvent = {
        ...eventData,
        start: new Date(currentDate),
        end: new Date(currentDate.getTime() + eventDuration)
      };
      
      // Supprimer les données de récurrence pour les instances individuelles
      delete newEvent.recurrence;
      
      const createdEvent = await CalendarEvent.create(newEvent);
      events.push(createdEvent);
      
      // Calculer la prochaine date selon la fréquence
      switch (frequency) {
        case "daily":
          currentDate.setDate(currentDate.getDate() + interval);
          break;
        case "weekly":
          currentDate.setDate(currentDate.getDate() + (7 * interval));
          break;
        case "monthly":
          currentDate.setMonth(currentDate.getMonth() + interval);
          break;
      }
    }
    
    return events;
  }
}
