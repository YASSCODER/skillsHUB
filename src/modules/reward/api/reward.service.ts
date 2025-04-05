import RewardsSchema from "../../../common/models/types/rewards.schema";
import RewardsHistorySchema from "../../../common/models/types/reward-history.schema";

class RewardsService {
  static async getUserRewards(userId: string) {
    return await RewardsSchema.findOne({ user: userId });
  }

  static async earnPoints(userId: string, points: number) {
    const rewards = await RewardsSchema.findOneAndUpdate(
      { user: userId },
      { $inc: { points: points } },
      { new: true, upsert: true }
    );

    await RewardsHistorySchema.create({ user: userId, type: "EARNED", points });
    return rewards;
  }

  static async redeemPoints(userId: string, points: number) {
    const rewards = await RewardsSchema.findOne({ user: userId });

    if (!rewards || rewards.points < points) {
      throw new Error("Insufficient points");
    }

    rewards.points -= points;
    rewards.redeemed += points;
    await rewards.save();

    await RewardsHistorySchema.create({ user: userId, type: "REDEEMED", points });

    return { message: "Points redeemed successfully", remainingPoints: rewards.points };
  }
}

export default RewardsService;
