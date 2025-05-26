import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';

const router = Router();

// Protéger toutes les routes
router.use(authMiddleware);

// Récupérer les notifications de l'utilisateur connecté
router.get('/', async (req, res) => {
  try {
    const userId = (req.user as any)._id;
    const notifications = await notificationService.getUserNotifications(userId);
    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Marquer une notification comme lue
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await notificationService.markAsRead(notificationId);
    res.status(200).json(notification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

