import mongoose from "mongoose";

const therapistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String, // e.g. "6 years"
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    clientsServed: {
      type: Number,
      default: 0,
    },
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
    responseTime: {
      type: String, // e.g. "15 mins"
    },
    fee: {
      type: Number,
      required: true,
    },
    image: {
      type: String, // or ObjectId if stored in another collection
    },
    certification: {
      type: String,
      trim: true,
    },
    badge: {
      type: String, // e.g. "Popular"
    },
    morningSlot:{
        type:Number,
        required:true
    },
     eveningSlot:{
        type:Number,
        required:true
    }

  },
  { timestamps: true }
);

export const Therapist = mongoose.model("Therapist", therapistSchema);
