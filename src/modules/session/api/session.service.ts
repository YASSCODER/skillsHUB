import Session, { SessionDocument } from "../../../common/models/session.schema";

export class SessionService {
  async createSession(data: Partial<SessionDocument>): Promise<SessionDocument> {
    const session = new Session({
      ...data,
      dateDebut: new Date(data.dateDebut ?? Date.now()),
      dateFin: new Date(data.dateFin ?? Date.now()),
    });
    return await session.save();
  }

  async findSessionsByUser(userId: string): Promise<SessionDocument[]> {
    return await Session.find({ createurId: userId }).exec() as SessionDocument[];
  }

  async getAllSessions(): Promise<SessionDocument[]> {
    return await Session.find().exec() as SessionDocument[];
  }

  async updateSession(id: string, data: Partial<SessionDocument>): Promise<SessionDocument | null> {
    return await Session.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSession(id: string): Promise<SessionDocument | null> {
    return await Session.findByIdAndDelete(id);
  }

  async countSessionsBySalon(salonId: string): Promise<number> {
    return await Session.countDocuments({ salonId });
  }

  async getSessionsByType(type: "chat" | "meet"): Promise<SessionDocument[]> {
    return await Session.find({ type });
  }


  async getAverageSessionDuration(): Promise<number> {
    const result = await Session.aggregate([
      {
        $project: {
          durationInMinutes: {
            $divide: [
              { $subtract: ["$dateFin", "$dateDebut"] },
              1000 * 60   // Conversion des millisecondes en minutes
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
}