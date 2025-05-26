import { Request, Response } from "express";
import { CalendarService } from "./calendar.service";
import mongoose from "mongoose";
import { notificationService } from '../../../common/services/notification.service';

export class CalendarController {
  private calendarService: CalendarService;

  constructor() {
    this.calendarService = new CalendarService();
  }

  // Récupérer les événements d'un salon
  async getSalonEvents(req: Request, res: Response): Promise<Response> {
    try {
      const { salonId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(salonId)) {
        return res.status(400).json({ error: "ID de salon invalide" });
      }
      
      console.log(`Récupération des événements pour le salon: ${salonId}`);
      const events = await this.calendarService.getEventsBySalon(salonId);
      console.log(`Événements trouvés: ${events ? events.length : 0}`);
      return res.status(200).json(events || []);
    } catch (error: any) {
      console.error("Erreur détaillée lors de la récupération des événements:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la récupération des événements", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Récupérer les événements d'un utilisateur
  async getUserEvents(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userId || (req.user as any)?._id;
      
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "ID utilisateur invalide" });
      }
      
      const events = await this.calendarService.getEventsByUser(userId);
      return res.status(200).json(events);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des événements:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Créer un nouvel événement
  async createEvent(req: Request, res: Response): Promise<Response> {
    try {
      const eventData = {
        ...req.body,
        createdBy: (req.user as any)?._id || req.body.createdBy
      };
      
      let event;
      // Vérifier si c'est un événement récurrent
      if (eventData.recurrence) {
        const events = await this.calendarService.createRecurringEvents(eventData);
        event = events[0]; // Premier événement de la série
        
        // Notifier les participants
        if (eventData.attendees && eventData.attendees.length > 0) {
          for (const userId of eventData.attendees) {
            await notificationService.createNotification({
              userId,
              message: `Vous avez été ajouté à un événement récurrent: ${eventData.title}`
            });
          }
        }
        
        return res.status(201).json(events);
      } else {
        event = await this.calendarService.createEvent(eventData);
        
        // Notifier les participants
        if (eventData.attendees && eventData.attendees.length > 0) {
          for (const userId of eventData.attendees) {
            await notificationService.createNotification({
              userId,
              message: `Vous avez été ajouté à l'événement: ${eventData.title}`
            });
          }
        }
        
        return res.status(201).json(event);
      }
    } catch (error: any) {
      console.error("Erreur lors de la création de l'événement:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  // Mettre à jour un événement
  async updateEvent(req: Request, res: Response): Promise<Response> {
    try {
      const { eventId } = req.params;
      const eventData = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "ID d'événement invalide" });
      }
      
      const updatedEvent = await this.calendarService.updateEvent(eventId, eventData);
      return res.status(200).json(updatedEvent);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'événement:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  // Supprimer un événement
  async deleteEvent(req: Request, res: Response): Promise<Response> {
    try {
      const { eventId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: "ID d'événement invalide" });
      }
      
      await this.calendarService.deleteEvent(eventId);
      return res.status(200).json({ message: "Événement supprimé avec succès" });
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'événement:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Vérifier la disponibilité d'un utilisateur
  async checkAvailability(userId: string, start: Date, end: Date): Promise<boolean> {
    // Implement the method directly in the controller until it's added to the service
    const events = await this.calendarService.getEventsByUser(userId);
    return events.every(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return end <= eventStart || start >= eventEnd;
    });
  }

  // Suggérer des créneaux disponibles
  async suggestAvailableSlots(userIds: string[], duration: number, startDate: Date, endDate: Date): Promise<any[]> {
    // Implement the method directly in the controller until it's added to the service
    const availableSlots = [];
    const slotDuration = duration * 60 * 1000; // Convert minutes to milliseconds
    
    // Get all events for each user
    const userEvents = await Promise.all(
      userIds.map(userId => this.calendarService.getEventsByUser(userId))
    );
    
    // Generate potential time slots between start and end dates
    const currentSlot = new Date(startDate);
    while (currentSlot.getTime() + slotDuration <= endDate.getTime()) {
      const slotEnd = new Date(currentSlot.getTime() + slotDuration);
      
      // Check if this slot is available for all users
      const isAvailableForAll = userIds.every((userId, index) => {
        const events = userEvents[index];
        return events.every(event => {
          const eventStart = new Date(event.start);
          const eventEnd = new Date(event.end);
          return slotEnd <= eventStart || currentSlot >= eventEnd;
        });
      });
      
      if (isAvailableForAll) {
        availableSlots.push({
          start: new Date(currentSlot),
          end: new Date(slotEnd)
        });
      }
      
      // Move to next slot (increment by 30 minutes)
      currentSlot.setMinutes(currentSlot.getMinutes() + 30);
    }
    
    return availableSlots;
  }
}
