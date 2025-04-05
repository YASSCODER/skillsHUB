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

  static async updateWallet(userId: string, walletData: any) {
    return await walletSchema.findOneAndUpdate({ user: userId }, walletData, { new: true });
  }

  static async deleteWallet(userId: string) {
    return await walletSchema.findOneAndDelete({ user: userId });
  }
}

export default WalletService;



  // static async getAllWallets() {
  //   return await walletSchema.find().populate("user").populate("imoney");
  // }


  // static async getWalletByUserId(userId: string) {
  //   return await walletSchema.findOne({ user: userId }).populate("imoney");
  // }


  // static async createWallet(userId: string) {
  //   const existingWallet = await walletSchema.findOne({ user: userId });

  //   if (existingWallet) {
  //     throw new Error("Wallet already exists for this user");
  //   }


  //   const newImoney = await Imoney.create({ currencyType: "USD", value: 0 });


  //   const newWallet = await walletSchema.create({
  //     user: userId,
  //     imoney: newImoney._id,
  //   });

  //   return newWallet;
  // }


  // static async updateWallet(userId: string, walletData: any) {
  //   console.log(`Updating wallet for user: ${userId}`);
  //   const wallet = await walletSchema.findOne({ user: userId }).populate("imoney");

  //   if (!wallet) {
  //     console.error("Wallet not found");
  //     throw new Error("Wallet not found");
  //   }

  //   if (walletData.imoney) {
  //     console.log(`Updating imoney for wallet: ${wallet.imoney._id}`);
  //     const imoneyUpdates = {
  //       currencyType: walletData.imoney.currencyType,
  //       value: walletData.imoney.value,
  //     };

  //     await Imoney.findByIdAndUpdate(wallet.imoney._id, imoneyUpdates);
  //   }
    
  //   const walletUpdates = {
  //     imoney: wallet.imoney._id,
  //     ...walletData,
  //   };

  //   console.log(`Updating wallet document for user: ${userId}`);
  //   const updatedWallet = await walletSchema.findOneAndUpdate(
  //     { user: userId },
  //     walletUpdates,
  //     { new: true }
  //   );

  //   console.log(`Wallet updated successfully for user: ${userId}`);
  //   return updatedWallet;
  // }


  // static async deleteWallet(userId: string) {
  //   const wallet = await walletSchema.findOneAndDelete({ user: userId });
  //   return wallet;
  // }

  // Top up imoney balance
  // static async topUpImoney(userId: string, amount: number) {
  //   // Find the user's wallet and populate the 'imoney' field
  //   const wallet = await walletSchema
  //     .findOne({ user: userId })
  //     .populate("imoney"); // Populating the 'imoney' reference to get the full document

  //   if (!wallet) {
  //     throw new Error("Wallet not found for the user");
  //   }

  //   if (!wallet.imoney) {
  //     throw new Error("Imoney not found for the user's wallet");
  //   }

  //   // Use the Document type for the populated 'imoney'
  //   const imoney = wallet.imoney as mongoose.Document & IImoney;

  //   // Now you can safely access imoney.value
  //   imoney.value += amount;

  //   // Save the updated imoney document
  //   await imoney.save();

  //   return imoney; // Return the updated imoney document
  // }








  // static async buyCourse(userId: string, courseId: string) { 
  // }



