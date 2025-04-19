import Badge from "../../../common/models/types/badge.schema";
import { IBadge } from "../../../common/models/interface/badge.interface";
import  Challenge  from "../../../common/models/types/challenge.schema";
import { BadgeEnum } from "../../../common/enum/badge.enum";
//import { BadgeEnum } from "../enums/badge.enum";

const badges: IBadge[] = [];

function getBadgeImageUrl(badgeType: string): string {
  const baseUrl = "https://ui-avatars.com/api/";
  const label = encodeURIComponent(badgeType);
  return `${baseUrl}?name=${label}&background=random&color=fff&bold=true&format=png`;
}

export class BadgeService {

  
  
  async awardBadge(userId: string, challengeId: string, score: number): Promise<IBadge | null> {
    try {
      // Vérifier si le challenge existe
      const challenge = await Challenge.findById(challengeId);
      if (!challenge) {
        throw new Error("Challenge non trouvé");
      }

      // Convertir la note sur 20 en pourcentage
      const percentage = (score / 20) * 100;

      // Calculer le score cumulé total de l'utilisateur
      const userBadges = await Badge.find({ userId });
      console.log("🎯 Badges récupérés depuis MongoDB:", userBadges);
      const totalPercentage = userBadges.reduce((acc, b) => acc + b.percentage, 0) + percentage;

      // Déterminer le badge en fonction du total
      let badgeType = BadgeEnum.DEBUTANT;
      let badgeName = "Aucun badge";

      if (totalPercentage >= 170) {
        badgeType = BadgeEnum.EXPERT;
        badgeName = "Badge d'Or";
      } else if (totalPercentage >= 100) {
        badgeType = BadgeEnum.INTERMIDIAIRE;
        badgeName = "Badge d'Argent";
      }

      // Créer et sauvegarder le badge
      const badge = new Badge({
        userId,
        challengeId,
        name: badgeName,
        type: badgeType,
        percentage,
        totalPercentage,
        awardedAt: new Date(),
        imageUrl: getBadgeImageUrl(badgeType),
      });

      await badge.save();

      // Vérifier si l'utilisateur atteint le certificat (1000%)
      if (totalPercentage >= 1000) {
        console.log(`🎉 L'utilisateur ${userId} a obtenu un certificat !`);
      }

      return badge;
    } catch (error) {
      console.error("Erreur dans awardBadge:", error);
      throw new Error("Erreur lors de l’attribution du badge");
    }
  }

  async findBadgesByUser(userId: string): Promise<IBadge[]> {
    return await Badge.find({ userId });
    }

    async getLeaderboard(): Promise<
  { userId: string; score: number; badgeCount: number }[]
> {
  const userScores: {
    [userId: string]: { score: number; badgeCount: number };
  } = {};

  const badgePoints: { [key: string]: number } = {
    "Badge d'Or": 10,
    "Badge d'Argent": 5,
    "Badge de Bronze": 2,
    "Badge de Participation": 1,
  };

  // 🔥 On récupère tous les badges de Mongo
  const allBadges = await Badge.find();

  for (const badge of allBadges) {
    const uid = badge.userId?.toString();
    if (!uid) continue;

    if (!userScores[uid]) {
      userScores[uid] = { score: 0, badgeCount: 0 };
    }

    userScores[uid].score += badgePoints[badge.name] || 0;
    userScores[uid].badgeCount++;
  }

  return Object.entries(userScores)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.score - a.score || b.badgeCount - a.badgeCount);
}

async updateBadge(id: string, updateData: Partial<IBadge>): Promise<IBadge | null> {
  const updatedBadge = await Badge.findByIdAndUpdate(id, updateData, {
    new: true, // pour retourner le document mis à jour
    runValidators: true, // applique les validateurs du schema
  });

  return updatedBadge;
}  

async findAll(): Promise<IBadge[]> {
  return await Badge.find();
}

async delete(id: string): Promise<boolean> {
  const result = await Badge.findByIdAndDelete(id);
  return result !== null;
}




}