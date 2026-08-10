import express from "express";
import {
  addDoctorWithImage,
  getAllDoctors,
  getDoctorById,
  updateDoctorById,
  deleteDoctorById,
} from "../Controllers/doctor.js";
import { uploadDoctorImage } from "../Middlewares/multer.js";

const router = express.Router();

// Add doctor with uploaded image
router.post("/add", uploadDoctorImage, addDoctorWithImage);

// Get all doctors
router.get("/all", getAllDoctors);

// Get a single doctor by ID
router.get("/:id", getDoctorById);

// Update doctor details by ID
router.put("/:id", updateDoctorById);

// Delete doctor and image by ID
router.delete("/:id", deleteDoctorById);

export default router;
