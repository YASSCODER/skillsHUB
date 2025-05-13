
import Community from "../../../common/models/types/community.schema";
import communitySchema from "../../../common/models/types/community.schema";

class CommunityService {
  // Méthodes CRUD de base
  async getAllCommunities() {
    return await communitySchema.find();
  }

  async getCommunityById(id: string): Promise<any> {
    return await Community.findById(id); // Fetch the community by its ID
  }


  async createCommunity(communityData: any) {
    return await communitySchema.create(communityData);
  }

  async updateCommunity(id: string, communityData: any) {
    return await communitySchema.findByIdAndUpdate(id, communityData, { new: true });
  }

  async deleteCommunity(id: string) {
    return await communitySchema.findByIdAndDelete(id);
  }

  // Méthodes métier supplémentaires :

  // Vérifier si un utilisateur est membre d'une communauté
  async isUserMember(communityId: string, userId: string) {
    const communityData = await communitySchema.findById(communityId);
    if (!communityData) throw new Error("Community not found");

    return communityData.members.includes(userId);
  }

  // Ajouter un membre à la communauté
  async addMemberToCommunity(communityId: string, userId: string) {
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
  async removeMemberFromCommunity(communityId: string, userId: string) {
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

  /**
   * Recherche des communautés par nom ou tags
   */
  async searchCommunities(query: string): Promise<any[]> {
    try {
      // Add error handling and validation
      if (!query) {
        return [];
      }
      
      // Use a try-catch block to handle potential regex errors
      let regex;
      try {
        regex = new RegExp(query, 'i');
      } catch (e) {
        // If the query contains special regex characters, escape them
        regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      }
      
      return await Community.find({
        $or: [
          { name: { $regex: regex } },
          { description: { $regex: regex } },
          { tags: { $regex: regex } }
        ]
      }).limit(10);
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
}

// À la fin du fichier
const communityService = new CommunityService();
export default communityService;
