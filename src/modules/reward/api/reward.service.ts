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

  static async earnPoints(userId: string, points: number, walletId: string, source = "manual") {
    if (!points || points <= 0) throw new Error("Points must be a positive number");
    if (!walletId) throw new Error("Wallet ID is required");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEarned = await RewardsHistorySchema.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          type: "EARNED",
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
      throw new Error(`You can't earn more than ${DAILY_LIMIT} points per day.`);
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
}

export default RewardsService;
