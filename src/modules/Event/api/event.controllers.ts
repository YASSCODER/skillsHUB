import { Request, Response } from "express";
import EventService from "./event.services";

class EventController {
  async getAllEvents(req: Request, res: Response) {
    const events = await EventService.getAllEvents();
    res.status(200).json(events);
  }

  async getEventById(req: Request, res: Response) {
    const { id } = req.params;
    const event = await EventService.getEventById(id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.status(200).json(event);
  }

  async createEvent(req: Request, res: Response) {
    try {
      console.log("Données reçues:", req.body);
      const eventData = req.body;
      const newEvent = await EventService.createEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      res.status(400).json({ 
        message: "Erreur lors de la création de l'événement", 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      });
    }
  }

  async updateEvent(req: Request, res: Response) {
    const { id } = req.params;
    const eventData = req.body;
    const updatedEvent = await EventService.updateEvent(id, eventData);
    
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.status(200).json(updatedEvent);
  }

  async deleteEvent(req: Request, res: Response) {
    const { id } = req.params;
    const deletedEvent = await EventService.deleteEvent(id);
    
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.status(200).json({ message: "Event deleted successfully" });
  }

  async getEventsByCommunity(req: Request, res: Response) {
    const { communityId } = req.params;
    const events = await EventService.getEventsByCommunity(communityId);
    res.status(200).json(events);
  }

  async getEventsByCreator(req: Request, res: Response) {
    const { creatorId } = req.params;
    const events = await EventService.getEventsByCreator(creatorId);
    res.status(200).json(events);
  }
}

export default new EventController();
