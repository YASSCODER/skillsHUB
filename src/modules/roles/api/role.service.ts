import roleSchema from "../../../common/models/types/role.schema";
export class RoleService {
  static async createRole(payload: any) {
    return await roleSchema.create(payload);
  }

  static async getAllRoles() {
    return await roleSchema.find();
  }

  static async getRoleById(id: string) {
    return await roleSchema.findById(id);
  }

  static async updateRole(id: string, payload: any) {
    return await roleSchema.findByIdAndUpdate(id, payload, { new: true });
  }

  static async deleteRole(id: string) {
    return await roleSchema.findByIdAndDelete(id);
  }
}
