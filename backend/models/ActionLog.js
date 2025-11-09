import mongoose from "mongoose";

const ActionLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  category: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("ActionLog", ActionLogSchema);
