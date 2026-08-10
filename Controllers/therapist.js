// import { Therapist } from "../Models/therapistSchema.js";
// import { Image } from "../Models/uploadImage.js";
// import fs from "fs/promises";
// import path from "path";
// import { fileURLToPath } from "url";

// // For ES Modules dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// /**
//  * Add therapist with uploaded image
//  */

// export const addTherapistWithImage = async (req, res) => {
//   try {
//     const file = req.file; // from multer.single("image")

//     let savedImage = null;
//     if (file) {
//       const { filename, path: imagePath } = file;
//       const newImage = new Image({ filename, path: imagePath });
//       savedImage = await newImage.save();
//     }

//     const {
//       name,
//       experience,
//       rating,
//       clientsServed,
//       specialties,
//       responseTime,
//       fee,
//       certification,
//       badge,
//       morningSlot,
//       eveningSlot
//     } = req.body;

//     // ✅ Validation
      
//     if (!name || !experience || !fee || !morningSlot || !eveningSlot) {
//       return res.status(400).json({
//         message: "All required fields (name, experience, fee, slots) must be filled",
//         success: false,
//       });
//     }

//     const therapist = await Therapist.create({
//       name,
//       experience,
//       rating,
//       clientsServed,
//       specialties: Array.isArray(specialties)
//         ? specialties
//         : specialties?.split(",").map((s) => s.trim()),
//       responseTime,
//       fee,
//       certification,
//       badge,
//       morningSlot,
//       eveningSlot,
//       image: savedImage ? savedImage._id : null,
//     });

//     res.status(201).json({
//       message: "Therapist added successfully",
//       success: true,
//       therapist,
//     });
//   } catch (error) {
//     console.error("Error adding therapist:", error.message);
//     res.status(500).json({
//       message: "Error occurred while adding therapist",
//       success: false,
//       errorMessage: error.message,
//     });
//   }
// };

// /**
//  * Get all therapists
//  */
// export const getAllTherapists = async (req, res) => {
//   try {
//     const therapists = await Therapist.find()
//       .populate("image")
//       .sort({ createdAt: -1 });

//     res.json({
//       message: "Fetched all therapists successfully",
//       success: true,
//       therapists,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error occurred while fetching therapists",
//       success: false,
//       errorMessage: error.message,
//     });
//   }
// };

// /**
//  * Get therapist by ID
//  */
// export const getTherapistById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const therapist = await Therapist.findById(id).populate("image");
//     if (!therapist) {
//       return res.status(404).json({
//         message: "Therapist not found",
//         success: false,
//       });
//     }

//     res.json({
//       message: "Therapist found successfully",
//       success: true,
//       therapist,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error fetching therapist by ID",
//       success: false,
//       errorMessage: error.message,
//     });
//   }
// };

// /**
//  * Update therapist by ID
//  */
// export const updateTherapistById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedTherapist = await Therapist.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });

//     if (!updatedTherapist) {
//       return res.status(404).json({
//         message: "Therapist not found",
//         success: false,
//       });
//     }

//     res.json({
//       message: "Therapist updated successfully",
//       success: true,
//       therapist: updatedTherapist,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to update therapist",
//       success: false,
//       errorMessage: error.message,
//     });
//   }
// };

// /**
//  * Delete therapist by ID (and its image)
//  */
// export const deleteTherapistById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const therapist = await Therapist.findById(id).populate("image");
//     if (!therapist) {
//       return res.status(404).json({
//         message: "Therapist not found",
//         success: false,
//       });
//     }

//     // 🧹 Delete image file and record
//     if (therapist.image) {
//       try {
//         const imagePath = path.join(
//           __dirname,
//           "../../pomwbUploads",
//           therapist.image.filename
//         );
//         await fs.unlink(imagePath);
//       } catch (err) {
//         console.error("Error deleting image file:", err.message);
//       }

//       await Image.findByIdAndDelete(therapist.image._id);
//     }

//     await Therapist.findByIdAndDelete(id);

//     res.json({
//       message: "Therapist and associated image deleted successfully",
//       success: true,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to delete therapist",
//       success: false,
//       errorMessage: error.message,
//     });
//   }
// };
