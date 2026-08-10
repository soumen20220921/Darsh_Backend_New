// bookingSchema.js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },

  FullName: String,
  Phone: String,
  Gender: String,
  Age: Number,

  Date: Date,
  Time: String,

  Slot: String, // ✅ ADD THIS

  transactionId: String,
  marchentId: String,

  amount: Number,
  payStatus: { type: String, default: "Not Paid" },

}, { timestamps: true });

export const Booking = mongoose.model('Booking', bookingSchema);
