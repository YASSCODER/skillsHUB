import { IBadge } from "../../../common/models/interface/badge.interface";
import badgeSchema from "../../../common/models/types/badge.schema";

const badges: IBadge[] = [];

export class BadgeService {
  async awardBadge(userId: string, challengeId: string, score: number) {
    let badgeName = "Participant";
    if (score >= 90) badgeName = "Expert";
    else if (score >= 70 && score < 90) badgeName = "Intermédiaire";
    else if (score >= 50 && score < 0) badgeName = "Débutant";

    const badge = await badgeSchema.findOne({ userId: userId });
  }

  async findBadgesByUser(userId: string): Promise<IBadge[]> {
    return badges.filter((badge) => badge.userId === userId);
  }

  async getLeaderboard(): Promise<
    { userId: string; score: number; badgeCount: number }[]
  > {
    const userScores: {
      [userId: string]: { score: number; badgeCount: number };
    } = {};

    const badgePoints: { [key: string]: number } = {
      Expert: 10,
      Intermédiaire: 5,
      Débutant: 2,
      Participant: 1,
    };

    for (const badge of badges) {
      if (!userScores[badge.userId]) {
        userScores[badge.userId] = { score: 0, badgeCount: 0 };
      }

      userScores[badge.userId].score += badgePoints[badge.name] || 0;
      userScores[badge.userId].badgeCount++;
    }

    return Object.entries(userScores)
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.score - a.score || b.badgeCount - a.badgeCount);
  }
}
