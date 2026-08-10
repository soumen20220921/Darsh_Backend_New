// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "../pomwbUploads");
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// });

// export const upload = multer({ storage });

// // Accept multiple fields with different image inputs
// export const uploadFields = upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "image1", maxCount: 1 },
//     // { name: "image2", maxCount: 1 },
//     // { name: "image3", maxCount: 1 }
// ]);

import multer from "multer";
import path from "path";
import fs from "fs";

// --- Utility: create upload folder if missing ---
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const uploadDir = path.join("../pomwbUploads");
ensureDirExists(uploadDir);

// ====================================================
// ✅ COMMON MULTER STORAGE FOR ALL FILES
// ====================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save everything in "pomwbUploads"
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

// Single file (Doctor image)
export const uploadDoctorImage = upload.single("image");
export const uploadTharapistImage = upload.single("image");


// Multiple images for products
export const uploadProductFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "image1", maxCount: 1 },
]);
