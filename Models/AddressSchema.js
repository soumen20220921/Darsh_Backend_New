// AddressSchema.js
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    FullName: { type: String, required: true },
    Add: { type: String, required: true },
    VillorCity: { type: String, required: true },
    Dist: { type: String, required: true },
    State: { type: String, required: true },
    Pin: { type: String, required: true },
    Phone: { type: String, required: true }
});

export const Address = mongoose.model('Address', addressSchema);
