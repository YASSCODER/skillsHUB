import communitySchema from "../../../common/models/types/community.schema";

class CommunityService {
  // Méthodes CRUD de base
  static async getAllCommunities() {
    return await communitySchema.find();
  }

  static async getCommunityById(id: string) {
    return await communitySchema.findById(id);
  }

  static async createCommunity(communityData: any) {
    return await communitySchema.create(communityData);
  }

  static async updateCommunity(id: string, communityData: any) {
    return await communitySchema.findByIdAndUpdate(id, communityData, { new: true });
  }

  static async deleteCommunity(id: string) {
    return await communitySchema.findByIdAndDelete(id);
  }

  // Méthodes métier supplémentaires :

  // Vérifier si un utilisateur est membre d'une communauté
  static async isUserMember(communityId: string, userId: string) {
    const communityData = await communitySchema.findById(communityId);
    if (!communityData) throw new Error("Community not found");

    return communityData.members.includes(userId);
  }

  // Ajouter un membre à la communauté
  static async addMemberToCommunity(communityId: string, userId: string) {
    const communityData = await communitySchema.findById(communityId);
    if (!communityData) throw new Error("Community not found");

    if (!communityData.members.includes(userId)) {
      communityData.members.push(userId);
      await communityData.save();
    } else {
      throw new Error("User is already a member");
    }

    return communityData;
  }

  // Retirer un membre d'une communauté
  static async removeMemberFromCommunity(communityId: string, userId: string) {
    const communityData = await communitySchema.findById(communityId);
    if (!communityData) throw new Error("Community not found");

    const memberIndex = communityData.members.indexOf(userId);
    if (memberIndex !== -1) {
      communityData.members.splice(memberIndex, 1);
      await communityData.save();
    } else {
      throw new Error("User is not a member of this community");
    }

    return communityData;
  }
}

export default CommunityService;
