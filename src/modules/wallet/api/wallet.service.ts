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
    console.log("Deactivating wallet with id:", walletId);

    const wallet = await walletSchema.findByIdAndUpdate(
      walletId,
      { isActive: false },
      { new: true }
    );

    console.log("Wallet after deactivation:", wallet);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return wallet;
  }

  static async activateWallet(walletId: string) {
    const wallet = await walletSchema.findByIdAndUpdate(
      walletId,
      { isActive: true },
      { new: true }
    );

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return wallet;
  }

}

export default WalletService;



  