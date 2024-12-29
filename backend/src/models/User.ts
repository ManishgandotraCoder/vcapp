// src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";
export const statusType = {
  online: "online",
  offline: "offline",
};
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  status: string;
  profilePic: string;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: {
      type: String,
      default: statusType.offline,
      enum: [statusType.online, statusType.offline],
    },
    profilePic: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
