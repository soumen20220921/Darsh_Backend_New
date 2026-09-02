import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true }, // matches formData.productName
  price: { type: Number, required: true }, // formData.price
  originalPrice: { type: Number }, // optional
  size: { type: String }, // formData.size
  category: { type: String, required: true }, // formData.category
  color: { type: String }, // formData.color
  blouseAvaliable: { type: Boolean }, // formData.blouseAvaliable
  stock: { type: Number, required: true }, // formData.stock
  hotSell: { type: Boolean}, 
  preBooking: { type: Boolean},
  description: { type: String, required: true }, // formData.description
  specification: { type: String, required: true }, // formData.specification
  images: [
    { type: String, required: true }, // imgSrc paths/URLs after upload
  ],
  createdAt: { type: Date, default: Date.now },
});

export const Product = mongoose.model("Product", productSchema);
