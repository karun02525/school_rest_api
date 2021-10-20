import mongoose from "mongoose";

const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    teacher_id: { type: String, required: true },
    class_id: { type: String, required: true },
    student_id: { type: String, required: true },
    noti_type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
