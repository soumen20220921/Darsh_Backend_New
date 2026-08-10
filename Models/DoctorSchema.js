import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: String,
    specialization: String,
    qualification: String,
    experience: Number,
    fees: Number,
    description: String,
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
