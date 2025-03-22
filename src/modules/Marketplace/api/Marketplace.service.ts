import MarketplaceSchema from "../../../common/models/types/marketplace.schema";

class MarketplaceService {
  static async getAllOffers() {
    return await MarketplaceSchema.find();
  }

  static async getofferById(id: string) {
    return await MarketplaceSchema.findById(id);
  }

  static async createOffer(skillData: any) {
    return await MarketplaceSchema.create(skillData);
  }

  static async updateOffer(id: string, skillData: any) {
    return await MarketplaceSchema.findByIdAndUpdate(id, skillData, { new: true });
  }

  static async deleteOffer(id: string) {
    return await MarketplaceSchema.findByIdAndDelete(id);
  }
}

export default MarketplaceService;
