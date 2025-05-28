import walletSchema from "./../../../common/models/types/wallet.schema";
import Imoney from "./../../../common/models/types/imoney.schema";
import userSchema from "./../../../common/models/types/user.schema";

class WalletService {
  static async getAllWallets() {
    return await walletSchema.find().populate("user").populate("imoney");
  }

  static async getWalletByUserId(userId: string) {
    return await walletSchema.findOne({ user: userId }).populate("user").populate("imoney");
  }

  static async getWalletById(id: string) {
    return await walletSchema.findById(id).populate("user").populate("imoney");
  }
  static async createWallet(walletData: any) {
    console.log("=== CREATE WALLET START ===");
    console.log("createWallet - Input data:", walletData);

    // Handle userId if provided instead of user
    if (walletData.userId && !walletData.user) {
      walletData.user = walletData.userId;
      delete walletData.userId;
    }

    // Set default values for iMoney if not provided
    const imoneyData = walletData.imoney || {
      currencyType: 'iMoney',
      value: 150
    };

    console.log("createWallet - Creating iMoney with data:", imoneyData);
    const imoney = await Imoney.create(imoneyData);
    console.log("createWallet - iMoney created:", imoney);

    const walletDataWithImoney = { ...walletData, imoney: imoney._id };
    console.log("createWallet - Creating wallet with data:", walletDataWithImoney);

    const wallet = await walletSchema.create(walletDataWithImoney);
    console.log("createWallet - Wallet created:", wallet);

    // Update user with wallet reference
    await userSchema.findByIdAndUpdate(walletData.user, { wallet: wallet._id }, { new: true });
    console.log("createWallet - User updated with wallet reference");

    // Return populated wallet
    const populatedWallet = await walletSchema.findById(wallet._id).populate("user").populate("imoney");
    console.log("createWallet - Returning populated wallet:", populatedWallet);
    console.log("=== CREATE WALLET END ===");

    return populatedWallet;
  }

  static async deactivateWallet(walletId: string) {

    const wallet = await walletSchema.findByIdAndUpdate(
        walletId,
        {
            isActive: false,
            deactivatedAt: new Date()
        },
        { new: true }
    );

    if (!wallet) {
        throw new Error("Wallet not found");
    }

    return wallet;
}

// WalletService.ts
static async activateWallet(walletId: string) {
  const wallet = await walletSchema.findById(walletId);

  if (!wallet) {
      throw new Error("Wallet not found");
  }

  if (wallet.deactivatedAt === null || wallet.deactivatedAt === undefined) {
      throw new Error("Wallet was never deactivated");
  }

  const deactivatedAt = new Date(wallet.deactivatedAt);
  const currentTime = new Date();
  const timeDifference = currentTime.getTime() - deactivatedAt.getTime();
  const hoursDifference = timeDifference / (1000 * 3600);

  if (hoursDifference < 48) {
      throw new Error("You can only activate the wallet after 48 hours of deactivation");
  }

  wallet.isActive = true;
  await wallet.save();

  return wallet;
}

static async topUpImoney(userId: string, imoneyValue: number) {
  console.log("=== TOP UP IMONEY DEBUG START ===");
  console.log("topUpImoney - Input parameters:", { userId, imoneyValue });
  console.log("topUpImoney - Looking for wallet with user ID:", userId);

  // First, find the wallet to get the imoney reference
  const wallet = await walletSchema.findOne({ user: userId }).populate("imoney").populate("user");

  console.log("topUpImoney - Wallet search result:", {
    found: !!wallet,
    walletId: wallet?._id,
    walletUserId: wallet?.user,
    userDetails: (wallet?.user as any)?.fullName || 'No user details',
    imoneyId: wallet?.imoney?._id,
    currentValue: (wallet?.imoney as any)?.value,
    isActive: wallet?.isActive,
  });

  if (!wallet || !wallet.imoney) {
    console.log("topUpImoney - ERROR: Wallet or Imoney not found");
    throw new Error("Wallet or Imoney not found for the user");
  }

  const imoneyId = wallet.imoney._id;
  const currentValue = (wallet.imoney as any)?.value;
  const expectedNewValue = currentValue + imoneyValue;

  console.log("topUpImoney - About to update iMoney document:", {
    imoneyId,
    currentValue,
    incrementBy: imoneyValue,
    expectedNewValue,
  });

  // Update the imoney document directly with explicit options
  const updatedImoney = await Imoney.findByIdAndUpdate(
    imoneyId,
    { $inc: { value: imoneyValue } },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false
    }
  );

  console.log("topUpImoney - iMoney update result:", {
    success: !!updatedImoney,
    previousValue: currentValue,
    incrementApplied: imoneyValue,
    actualNewValue: updatedImoney?.value,
    expectedNewValue,
    updateWorked: updatedImoney?.value === expectedNewValue,
  });

  if (!updatedImoney) {
    console.log("topUpImoney - ERROR: Failed to update iMoney value");
    throw new Error("Failed to update iMoney value");
  }

  // Verify the update by fetching fresh data
  const verificationImoney = await Imoney.findById(imoneyId);
  console.log("topUpImoney - Verification fetch:", {
    verificationValue: verificationImoney?.value,
    matchesUpdate: verificationImoney?.value === updatedImoney.value,
  });

  // Return the wallet with updated imoney
  const updatedWallet = await walletSchema.findById(wallet._id).populate("imoney");

  console.log("topUpImoney - Final wallet state:", {
    walletId: updatedWallet?._id,
    finalValue: (updatedWallet?.imoney as any)?.value,
    updatePersisted: (updatedWallet?.imoney as any)?.value === expectedNewValue,
  });
  console.log("=== TOP UP IMONEY DEBUG END ===");

  return updatedWallet;
}

// Alternative method using direct document manipulation
static async topUpImoneyAlternative(userId: string, imoneyValue: number) {
  console.log("=== ALTERNATIVE TOP UP METHOD START ===");
  console.log("topUpImoneyAlternative - Input:", { userId, imoneyValue });

  // Find wallet and imoney
  const wallet = await walletSchema.findOne({ user: userId }).populate("imoney");

  if (!wallet || !wallet.imoney) {
    throw new Error("Wallet or Imoney not found");
  }

  const imoneyDoc = await Imoney.findById(wallet.imoney._id);
  if (!imoneyDoc) {
    throw new Error("iMoney document not found");
  }

  console.log("topUpImoneyAlternative - Before update:", {
    currentValue: imoneyDoc.value,
    toAdd: imoneyValue,
  });

  // Update using direct assignment and save
  imoneyDoc.value += imoneyValue;
  const savedImoney = await imoneyDoc.save();

  console.log("topUpImoneyAlternative - After save:", {
    newValue: savedImoney.value,
    saveSuccessful: !!savedImoney,
  });

  // Return updated wallet
  const finalWallet = await walletSchema.findById(wallet._id).populate("imoney");
  console.log("=== ALTERNATIVE TOP UP METHOD END ===");

  return finalWallet;
}

// Note: imoneyPrice has been removed from skills and challenges schemas
// This method is deprecated but kept for backward compatibility
static async updateAllPricesToSixtyFive() {
  console.log("=== DEPRECATED: imoneyPrice has been removed from schemas ===");

  return {
    skillsUpdated: 0,
    challengesUpdated: 0,
    totalSkills: 0,
    totalChallenges: 0,
    message: "imoneyPrice attribute has been removed from skills and challenges schemas"
  };
}

// Purchase challenge with iMoney
// Note: imoneyPrice is now passed as parameter since it's removed from schema
static async purchaseChallenge(userId: string, challengeId: string, imoneyPrice: number) {
  console.log("=== PURCHASE CHALLENGE START ===");
  console.log("purchaseChallenge - Input:", { userId, challengeId, imoneyPrice });

  // Find wallet and check balance
  const wallet = await walletSchema.findOne({ user: userId }).populate("imoney");

  if (!wallet || !wallet.imoney) {
    throw new Error("Wallet not found for user");
  }

  const currentBalance = (wallet.imoney as any)?.value;
  console.log("purchaseChallenge - Current balance:", currentBalance);

  if (currentBalance < imoneyPrice) {
    throw new Error(`Insufficient iMoney balance. Required: ${imoneyPrice}, Available: ${currentBalance}`);
  }

  // Deduct iMoney from wallet
  const updatedImoney = await Imoney.findByIdAndUpdate(
    wallet.imoney._id,
    { $inc: { value: -imoneyPrice } },
    { new: true }
  );

  if (!updatedImoney) {
    throw new Error("Failed to deduct iMoney from wallet");
  }

  console.log("purchaseChallenge - iMoney deducted:", {
    previousBalance: currentBalance,
    deducted: imoneyPrice,
    newBalance: updatedImoney.value,
  });

  // Return updated wallet
  const updatedWallet = await walletSchema.findById(wallet._id).populate("imoney");
  console.log("=== PURCHASE CHALLENGE END ===");

  return {
    wallet: updatedWallet,
    transaction: {
      type: 'challenge_purchase',
      challengeId,
      amount: imoneyPrice,
      newBalance: updatedImoney.value
    }
  };
}

// Purchase skill with iMoney
// Note: imoneyPrice is now passed as parameter since it's removed from schema
static async purchaseSkill(userId: string, skillId: string, imoneyPrice: number) {
  console.log("=== PURCHASE SKILL START ===");
  console.log("purchaseSkill - Input:", { userId, skillId, imoneyPrice });

  // Find wallet and check balance
  const wallet = await walletSchema.findOne({ user: userId }).populate("imoney");

  if (!wallet || !wallet.imoney) {
    throw new Error("Wallet not found for user");
  }

  const currentBalance = (wallet.imoney as any)?.value;
  console.log("purchaseSkill - Current balance:", currentBalance);

  if (currentBalance < imoneyPrice) {
    throw new Error(`Insufficient iMoney balance. Required: ${imoneyPrice}, Available: ${currentBalance}`);
  }

  // Deduct iMoney from wallet
  const updatedImoney = await Imoney.findByIdAndUpdate(
    wallet.imoney._id,
    { $inc: { value: -imoneyPrice } },
    { new: true }
  );

  if (!updatedImoney) {
    throw new Error("Failed to deduct iMoney from wallet");
  }

  console.log("purchaseSkill - iMoney deducted:", {
    previousBalance: currentBalance,
    deducted: imoneyPrice,
    newBalance: updatedImoney.value,
  });

  // Return updated wallet
  const updatedWallet = await walletSchema.findById(wallet._id).populate("imoney");
  console.log("=== PURCHASE SKILL END ===");

  return {
    wallet: updatedWallet,
    transaction: {
      type: 'skill_purchase',
      skillId,
      amount: imoneyPrice,
      newBalance: updatedImoney.value
    }
  };
}
}

export default WalletService;




