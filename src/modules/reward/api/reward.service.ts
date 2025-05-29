import RewardsSchema from "../../../common/models/types/rewards.schema";
import RewardsHistorySchema from "../../../common/models/types/reward-history.schema";
import mongoose from "mongoose";

class RewardsService {
  static async getUserRewards(userId: string) {
    return await RewardsSchema.findOne({ user: userId });
  }

  static async getUserHistory(userId: string) {
    return await RewardsHistorySchema.find({ user: userId }).sort({ createdAt: -1 });
  }

  static async earnPoints(userId: string, points: number, walletId: string, source = "manual", description?: string, relatedId?: string) {
    if (!points || points <= 0) throw new Error("Points must be a positive number");
    if (!walletId) throw new Error("Wallet ID is required");

    console.log("=== EARNING POINTS ===");
    console.log("earnPoints - Input:", { userId, points, walletId, source, description, relatedId });

    // Check daily limit only for manual points, not automatic rewards
    if (source === "manual") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayEarned = await RewardsHistorySchema.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            type: "EARNED",
            source: "manual",
            createdAt: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$points" }
          }
        }
      ]);

      const totalToday = todayEarned[0]?.total || 0;
      const DAILY_LIMIT = 100;

      if (totalToday + points > DAILY_LIMIT) {
        throw new Error(`You can't earn more than ${DAILY_LIMIT} manual points per day.`);
      }
    }

    const rewards = await RewardsSchema.findOneAndUpdate(
      { user: userId },
      { $inc: { points: points } },
      { new: true, upsert: true }
    );

    await RewardsHistorySchema.create({
      user: userId,
      type: "EARNED",
      points,
      wallet: walletId,
      source,
      description,
      relatedId
    });

    console.log("earnPoints - Points earned successfully:", {
      userId,
      pointsEarned: points,
      totalPoints: rewards.points,
      source
    });

    return rewards;
  }

  static async redeemPoints(userId: string, points: number, walletId: string, source = "manual") {
    if (!points || points <= 0) throw new Error("Points must be a positive number");
    if (!walletId) throw new Error("Wallet ID is required");

    const rewards = await RewardsSchema.findOne({ user: userId });

    if (!rewards || rewards.points < points) {
      throw new Error("Insufficient points");
    }

    rewards.points -= points;
    rewards.redeemed += points;
    await rewards.save();

    await RewardsHistorySchema.create({
      user: userId,
      type: "REDEEMED",
      points,
      wallet: walletId,
      source
    });

    return {
      message: "Points redeemed successfully",
      remainingPoints: rewards.points
    };
  }

  // Automatic point earning for wallet top-up (legacy method)
  static async earnPointsForTopUp(userId: string, walletId: string, imoneyAmount: number, transactionId: string) {
    console.log("=== EARNING POINTS FOR TOP-UP (LEGACY) ===");

    // Earn 1 point for every 10 iMoney topped up (minimum 1 point)
    const pointsToEarn = Math.max(1, Math.floor(imoneyAmount / 10));

    return await this.earnPoints(
      userId,
      pointsToEarn,
      walletId,
      "wallet_topup",
      `Earned ${pointsToEarn} points for topping up ${imoneyAmount} iMoney`,
      transactionId
    );
  }

  // Custom point earning for wallet top-up with package-specific points
  static async earnCustomPointsForTopUp(userId: string, walletId: string, customPoints: number, packageName: string, transactionId: string) {
    console.log("=== EARNING CUSTOM POINTS FOR TOP-UP ===");
    console.log("earnCustomPointsForTopUp - Input:", { userId, walletId, customPoints, packageName, transactionId });

    if (customPoints <= 0) {
      console.log("earnCustomPointsForTopUp - No points to award, using legacy method");
      return { points: 0, message: "No custom points specified" };
    }

    return await this.earnPoints(
      userId,
      customPoints,
      walletId,
      "wallet_topup",
      `Earned ${customPoints} points for purchasing ${packageName} package`,
      transactionId
    );
  }

  // Automatic point earning for skill purchase
  static async earnPointsForSkillPurchase(userId: string, walletId: string, skillId: string, imoneySpent: number) {
    console.log("=== EARNING POINTS FOR SKILL PURCHASE ===");

    // Earn 1 point for every 20 iMoney spent on skills (minimum 1 point)
    const pointsToEarn = Math.max(1, Math.floor(imoneySpent / 20));

    return await this.earnPoints(
      userId,
      pointsToEarn,
      walletId,
      "skill_purchase",
      `Earned ${pointsToEarn} points for purchasing skill (${imoneySpent} iMoney)`,
      skillId
    );
  }

  // Automatic point earning for challenge purchase
  static async earnPointsForChallengePurchase(userId: string, walletId: string, challengeId: string, imoneySpent: number) {
    console.log("=== EARNING POINTS FOR CHALLENGE PURCHASE ===");

    // Earn 1 point for every 15 iMoney spent on challenges (minimum 1 point)
    const pointsToEarn = Math.max(1, Math.floor(imoneySpent / 15));

    return await this.earnPoints(
      userId,
      pointsToEarn,
      walletId,
      "challenge_purchase",
      `Earned ${pointsToEarn} points for purchasing challenge (${imoneySpent} iMoney)`,
      challengeId
    );
  }

  // Convert points to iMoney with tiered rates
  static async convertPointsToImoney(userId: string, points: number, walletId: string) {
    console.log("=== CONVERTING POINTS TO IMONEY ===");
    console.log("convertPointsToImoney - Input:", { userId, points, walletId });

    if (!points || points <= 0) throw new Error("Points must be a positive number");
    if (!walletId) throw new Error("Wallet ID is required");

    // Check if user has enough points
    const rewards = await RewardsSchema.findOne({ user: userId });
    if (!rewards || rewards.points < points) {
      throw new Error("Insufficient points");
    }

    // Tiered conversion rates
    const conversionTiers = [
      { points: 100, imoney: 10 },
      { points: 200, imoney: 25 },
      { points: 300, imoney: 40 },
      { points: 400, imoney: 55 }
    ];

    // Find the matching tier
    const tier = conversionTiers.find(t => t.points === points);
    if (!tier) {
      const validAmounts = conversionTiers.map(t => t.points).join(', ');
      throw new Error(`Invalid conversion amount. Valid amounts: ${validAmounts} points`);
    }

    const imoneyToAdd = tier.imoney;
    const pointsToDeduct = tier.points;

    console.log("convertPointsToImoney - Conversion:", {
      pointsToDeduct,
      imoneyToAdd,
      tier: tier,
      conversionRate: `${tier.points} points = ${tier.imoney} iMoney`
    });

    // Deduct points
    rewards.points -= pointsToDeduct;
    rewards.redeemed += pointsToDeduct;
    await rewards.save();

    // Record the conversion in history
    await RewardsHistorySchema.create({
      user: userId,
      type: "REDEEMED",
      points: pointsToDeduct,
      wallet: walletId,
      source: "points_to_imoney",
      description: `Converted ${pointsToDeduct} points to ${imoneyToAdd} iMoney`,
      relatedId: `conversion_${Date.now()}`
    });

    console.log("convertPointsToImoney - Points deducted successfully:", {
      pointsDeducted: pointsToDeduct,
      imoneyToAdd,
      remainingPoints: rewards.points
    });

    return {
      pointsDeducted: pointsToDeduct,
      imoneyToAdd,
      remainingPoints: rewards.points,
      conversionTier: tier,
      conversionRate: `${tier.points} points = ${tier.imoney} iMoney`
    };
  }

  // Get conversion info with tiered rates
  static async getConversionInfo(userId: string) {
    const rewards = await RewardsSchema.findOne({ user: userId });
    const userPoints = rewards?.points || 0;

    // Tiered conversion rates
    const conversionTiers = [
      { points: 100, imoney: 10 },
      { points: 200, imoney: 25 },
      { points: 300, imoney: 40 },
      { points: 400, imoney: 55 }
    ];

    // Find the highest tier the user can afford
    const availableTiers = conversionTiers.filter(tier => userPoints >= tier.points);
    const bestTier = availableTiers.length > 0 ? availableTiers[availableTiers.length - 1] : null;

    return {
      userPoints,
      conversionTiers,
      availableTiers,
      bestTier,
      canConvert: userPoints >= 100,
      minimumPoints: 100
    };
  }
}

export default RewardsService;
