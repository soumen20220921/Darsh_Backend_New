import express from "express";
import {
  addProductWithImages,
  allProduct,
  findProductById,
  updateProductById,
  deleteProductById,
} from "../Controllers/product.js";
import { uploadProductFields } from "../Middlewares/multer.js"; // 👈 single image upload middleware

const router = express.Router();

// POST: Add product with single image upload
router.post("/addProduct", uploadProductFields, addProductWithImages);

// GET: Fetch all products
router.get("/getAllProduct", allProduct);

// GET: Fetch product by ID
router.get("/:id", findProductById);

// PUT: Update product by ID
router.put("/:id", updateProductById);

// DELETE: Delete product by ID (and its image)
router.delete("/:id", deleteProductById);

export default router;
