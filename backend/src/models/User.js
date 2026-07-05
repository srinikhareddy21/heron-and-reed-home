import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

/**
 * Builds the public-facing profile shape the frontend expects.
 * `defaultAddress` is looked up separately from the Address collection and
 * passed in here so this model doesn't need to know about it directly.
 */
userSchema.methods.toProfile = function toProfile(defaultAddress) {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    memberSince: this.createdAt.toISOString(),
    address: defaultAddress ?? undefined,
  };
};

export const User = mongoose.model("User", userSchema);
