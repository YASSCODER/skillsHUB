import { Feed } from "../../common/models/interface/feedback.inteface";
import feedbackSchema from "../../common/models/types/feedback.schema";

export class FeedbackService {
  async create(data: Partial<Feed>) {
    return await feedbackSchema.create(data);
  }

  async findAll() {
    return await feedbackSchema.find();
  }

  async findById(id: string) {
    return await feedbackSchema.findById(id);
  }

  async update(id: string, data: Partial<Feed>) {
    return await feedbackSchema.findByIdAndUpdate(id, data);
  }

  async delete(id: string) {
    return await feedbackSchema.findByIdAndDelete(id);
  }
}
