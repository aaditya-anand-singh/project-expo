import mongoose from "mongoose";

const screenshotSchema = new mongoose.Schema(
  {
    image: { type: Buffer, required: true },
    contentType: { type: String, default: "image/jpeg" },
  },
  { timestamps: true }
);

const Screenshot = mongoose.model("Screenshot", screenshotSchema);
export default Screenshot;
