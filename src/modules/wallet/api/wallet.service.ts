import walletSchema from "./../../../common/models/types/wallet.schema";
import Imoney from "./../../../common/models/types/imoney.schema";
import userSchema from "./../../../common/models/types/user.schema";

class WalletService {
  static async getAllWallets() {
    return await walletSchema.find().populate("user").populate("imoney");
  }

  static async getWalletByUserId(userId: string) {
    return await walletSchema.findOne({ user: userId }).populate("imoney");
  }

  static async createWallet(walletData: any) {
    const imoneyData = walletData.imoney
    const imoney = await Imoney.create(imoneyData);
    const walletDataWithImoney = { ...walletData, imoney: imoney._id };
    const wallet = await walletSchema.create(walletDataWithImoney);
    await userSchema.findByIdAndUpdate(walletData.user, { wallet: wallet._id }, { new: true });
    return wallet;
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

  const wallet = await walletSchema.findOneAndUpdate(
    { user: userId },
    { $inc: { "imoney.value": imoneyValue } },
    { new: true }
  ).populate("imoney");

  if (!wallet || !wallet.imoney) {
    throw new Error("Wallet or Imoney not found for the user");
  }

  return wallet;
}
}

export default WalletService;



  