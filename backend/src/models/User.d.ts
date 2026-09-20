import mongoose from "mongoose";
export type UserRole = "admin" | "field_manager";
export interface IUser {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default User;
//# sourceMappingURL=User.d.ts.map