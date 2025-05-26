import Badge from "../../../common/models/types/badge.schema";
import { IBadge } from "../../../common/models/interface/badge.interface";
import  Challenge  from "../../../common/models/types/challenge.schema";
import { BadgeEnum } from "../../../common/enum/badge.enum";
import userSchema from "../../../common/models/types/user.schema";
import { sendCertificateEmail } from "../../../common/utils/mailService";
import badgeSchema from "../../../common/models/types/badge.schema";
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
  
      const percentage = score;
  
      // Déterminer le badge uniquement en fonction du score actuel
      let badgeType: BadgeEnum;
      let badgeName: string;
  
      if (percentage > 200) {
        badgeType = BadgeEnum.EXPERT;
        badgeName = "Badge d'Or";
      } else if (percentage >= 170 && percentage <= 200) {
        badgeType = BadgeEnum.EXPERT;
        badgeName = "Badge d'Or";
      } else if (percentage >= 100 && percentage < 170) {
        badgeType = BadgeEnum.INTERMIDIAIRE;
        badgeName = "Badge d'Argent";
      } else {
        badgeType = BadgeEnum.DEBUTANT;
        badgeName = "Badge de Bronze";
      }

      
  
      // 🔁 Calculer le score total cumulé UNIQUEMENT pour le certificat
      const userBadges = await Badge.find({ userId });
      const totalPercentage = userBadges.reduce((acc, b) => acc + b.percentage, 0) + percentage;
  
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
  
        const certificateImageUrl = `https://ui-avatars.com/api/?name=Certificat&background=ffcc00&color=000&bold=true&format=png`;
  
        badge.certificateImageUrl = certificateImageUrl;
        await badge.save();
  
        const user = await userSchema.findById(userId);
        if (user && user.email) {
          await sendCertificateEmail(user.email, user.fullName || 'Utilisateur');
        }
      }
  
      return badge;
    } catch (error) {
      console.error("Erreur dans awardBadge:", error);
      throw new Error("Erreur lors de l’attribution du badge");
    }
  }

  async findBadgesByUser(userId: string) {
    return await badgeSchema.find({ userId })
      .populate("challengeId", "title")
      .populate("userId", "fullName email");
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

async findAll() {
  return await badgeSchema.find()
    .populate("userId", "fullName email")
    .populate("challengeId", "title");
}

async delete(id: string): Promise<boolean> {
  const result = await Badge.findByIdAndDelete(id);
  return result !== null;
}




}