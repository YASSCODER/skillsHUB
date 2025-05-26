import { Server as SocketServer } from 'socket.io';
import Notification from '../../common/models/notification.schema';

export class NotificationService {
  private io: SocketServer | null = null;

  initialize(io: SocketServer) {
    this.io = io;
  }

  async createNotification(data: { userId: string, message: string }) {
    try {
      // Créer la notification dans la base de données
      const notification = await Notification.create({
        userId: data.userId,
        message: data.message,
        date: new Date(),
        lu: false
      });

      // Émettre la notification en temps réel
      if (this.io) {
        this.io.to(data.userId).emit('notification', notification);
      }

      return notification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string) {
    return await Notification.find({ userId }).sort({ date: -1 });
  }

  async markAsRead(notificationId: string) {
    return await Notification.findByIdAndUpdate(
      notificationId, 
      { lu: true }, 
      { new: true }
    );
  }
}

export const notificationService = new NotificationService();