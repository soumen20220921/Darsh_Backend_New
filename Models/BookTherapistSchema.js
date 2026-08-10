// bookingSchema.js
import mongoose from 'mongoose';

const bookingTherapistSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tharapist' },
    
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
},{ strict: false });

export const Bookingtherapist = mongoose.model('BookingTherapist', bookingTherapistSchema);
