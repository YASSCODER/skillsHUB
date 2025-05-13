import mongoose from "mongoose";
import eventSchema from "../../../common/models/types/event.schema";

class EventService {
  // Get all events
  async getAllEvents() {
    return await eventSchema.find();
  }

  // Get event by ID
  async getEventById(id: string) {
    return await eventSchema.findById(id);
  }

  // Create new event
  async createEvent(eventData: any) {
    const newEvent = new eventSchema(eventData);
    return await newEvent.save();
  }

  // Update event
  async updateEvent(id: string, eventData: any) {
    return await eventSchema.findByIdAndUpdate(id, eventData, { new: true });
  }

  // Delete event
  async deleteEvent(id: string) {
    return await eventSchema.findByIdAndDelete(id);
  }

  // Get events by community
  async getEventsByCommunity(communityId: string) {
    const communityObjectId = new mongoose.Types.ObjectId(communityId);
    return await eventSchema.find({ community: communityObjectId });
  }

  // Get events by creator
  async getEventsByCreator(creatorId: string) {
    const creatorObjectId = new mongoose.Types.ObjectId(creatorId);
    return await eventSchema.find({ creator: creatorObjectId });
  }
}

export default new EventService();