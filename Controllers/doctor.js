import { Doctor } from "../Models/DoctorSchema.js";
import { Image } from "../Models/uploadImage.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// For ES Modules dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Add doctor with uploaded image
 */
export const addDoctorWithImage = async (req, res) => {
  try {
    const file = req.file; // from multer.single("image")

    let savedImage = null;
    if (file) {
      const { filename, path: imagePath } = file;
      const newImage = new Image({ filename, path: imagePath });
      savedImage = await newImage.save();
    }

    const {
      name,
      specialization,
      qualification,
      experience,
      fees,
      description,
    } = req.body;

    if (!name || !specialization || !qualification || !experience || !fees) {
      return res.status(400).json({
        message: "All required fields must be filled",
        success: false,
      });
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      qualification,
      experience,
      fees,
      description,
      image: savedImage ? savedImage._id : null,
    });

    res.status(201).json({
      message: "Doctor added successfully",
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Error adding doctor:", error.message);
    res.status(500).json({
      message: "Error occurred while adding doctor",
      success: false,
      errorMessage: error.message,
    });
  }
};

/**
 * Get all doctors
 */
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("image").sort({ createdAt: -1 });
    res.json({
      message: "Fetched all doctors successfully",
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error occurred while fetching doctors",
      success: false,
      errorMessage: error.message,
    });
  }
};

/**
 * Get doctor by ID
 */
export const getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.findById(id).populate("image");
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
        success: false,
      });
    }
    res.json({
      message: "Doctor found successfully",
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching doctor by ID",
      success: false,
      errorMessage: error.message,
    });
  }
};

/**
 * Update doctor by ID
 */
export const updateDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedDoctor) {
      return res.status(404).json({
        message: "Doctor not found",
        success: false,
      });
    }
    res.json({
      message: "Doctor updated successfully",
      success: true,
      doctor: updatedDoctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update doctor",
      success: false,
      errorMessage: error.message,
    });
  }
};

/**
 * Delete doctor by ID (and its image)
 */
export const deleteDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.findById(id).populate("image");
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
        success: false,
      });
    }

    if (doctor.image) {
      try {
        const imagePath = path.join(__dirname, "../../pomwbUploads", doctor.image.filename);
        await fs.unlink(imagePath);
      } catch (err) {
        console.error("Error deleting image file:", err.message);
      }
      await Image.findByIdAndDelete(doctor.image._id);
    }

    await Doctor.findByIdAndDelete(id);

    res.json({
      message: "Doctor and associated image deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete doctor",
      success: false,
      errorMessage: error.message,
    });
  }
};
