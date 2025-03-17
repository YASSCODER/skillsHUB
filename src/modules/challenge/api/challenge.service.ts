import { IChallenge } from "../../../common/models/interface/challenge.interface";
import challengeSchema from "../../../common/models/types/challenge.schema";

const challenges: IChallenge[] = [];

export class ChallengeService {
  async create(challenge: IChallenge): Promise<IChallenge> {
    challenge.id = Date.now().toString();
    challenge.createdAt = new Date();
    challenges.push(challenge);
    return challenge;
  }

  async findAll(): Promise<IChallenge[]> {
    return challenges;
  }

  async findById(id: string): Promise<IChallenge | undefined> {
    return challenges.find((challenge) => challenge.id === id);
  }

  async update(
    id: string,
    updatedChallenge: Partial<IChallenge>
  ): Promise<IChallenge | null> {
    return await challengeSchema.findByIdAndUpdate(id, updatedChallenge, {
      new: true,
    });
  }

  async delete(id: string): Promise<boolean> {
    const index = challenges.findIndex((ch) => ch.id === id);
    if (index === -1) return false;
    challenges.splice(index, 1);
    return true;
  }
}
