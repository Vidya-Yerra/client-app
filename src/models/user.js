import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Client" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
