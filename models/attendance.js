import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SubmitedSchema = new Schema({
        student_id: { type: String, required: true },
        name:{ type: String, required: true },
        att_type: { type: Number, required: true },
});

const AttendanceSchema = new Schema(
  {
    teacher_id: { type: String, required: true },
    class_id: { type: String, required: true },
    attlist: [SubmitedSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", AttendanceSchema);
