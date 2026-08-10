import { Product } from "../Models/ProductSchema.js";
import { Image } from "../Models/uploadImage.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// For ES Modules dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Add product with uploaded images
 */
export const addProductWithImages = async (req, res) => {
  try {
    const files = req.files; // from multer.fields()
    const allFiles = [];

    // Collect files from both fields
    if (files.image) allFiles.push(...files.image);
    if (files.image1) allFiles.push(...files.image1);

    // Save each uploaded image in DB
    const savedImages = await Promise.all(
      allFiles.map((file) => {
        const { filename, path } = file;
        const newImage = new Image({ filename, path });
        return newImage.save();
      })
    );

    const imageIds = savedImages.map((img) => img._id);

    // Extract product details
    const {
      productName,
      price,
      originalPrice,
      size,
      category,
      color,
      blouseAvaliable,
      stock,
      hotSell,
      description,
      specification,
    } = req.body;

    // Validate
    if (
      !productName ||
      !price ||
      !category ||
      !stock ||
      !description ||
      !specification
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled", success: false });
    }

    if (imageIds.length < 1) {
      return res
        .status(400)
        .json({ message: "At least one image is required", success: false });
    }

    // Save product
    const product = await Product.create({
      productName,
      price,
      originalPrice,
      size,
      category,
      color,
      blouseAvaliable,
      stock,
      hotSell,
      description,
      specification,
      images: imageIds,
    });

    res.status(201).json({
      message: "Product and images added successfully",
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({
      message: "Error occurred while adding product",
      success: false,
      errorMessage: error.message,
    });
  }
};


/**
 * Get all products
 */
export const allProduct = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("images") // optional: populate image details
      .sort({ createdAt: -1 });

    res.json({
      message: "Fetched all products successfully",
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error occurred while fetching products",
      success: false,
      errorMessage: error.message,
    });
  }
};

/**
 * Find product by ID
 */
export const findProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate("images");
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }
    res.json({ message: "Product found", success: true, product });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product by ID",
      success: false,
      errorMessage: error.message,
    });
  }
};

/**
 * Update product by ID
 */
export const updateProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }
    res.json({
      message: "Product updated successfully",
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product by ID",
      success: false,
      errorMessage: error.message,
    });
  }
};

/**
 * Delete product by ID (and its images)
 */
export const deleteProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate("images");
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }

    // Delete all associated images from disk & DB
    for (const image of product.images) {
      try {
        const imagePath = path.join(__dirname, "../../pomwbUploads", image.filename);
        await fs.unlink(imagePath);
      } catch (err) {
        console.error("Error deleting image file:", err.message);
      }
      await Image.findByIdAndDelete(image._id);
    }

    await Product.findByIdAndDelete(id);

    res.json({
      message: "Product and associated images deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product by ID",
      success: false,
      errorMessage: error.message,
    });
  }
};
