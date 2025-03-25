import walletSchema from "./../../../common/models/types/wallet.schema";

class WalletService {
  static async getAllWallets() {
    return await walletSchema.find().populate("user").populate("imoney");
  }

  static async getWalletByUserId(userId: string) {
    return await walletSchema.findOne({ user: userId }).populate("imoney");
  }

  static async createWallet(walletData: any) {
    return await walletSchema.create(walletData);
  }

  static async updateWallet(userId: string, walletData: any) {
    return await walletSchema.findOneAndUpdate({ user: userId }, walletData, { new: true });
  }

  static async deleteWallet(userId: string) {
    return await walletSchema.findOneAndDelete({ user: userId });
  }
}

export default WalletService;
