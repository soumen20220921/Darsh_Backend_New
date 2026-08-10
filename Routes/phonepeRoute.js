import { newPayment, checkStatus, phonePeWebhook} from "./../Controllers/paymentController.js";
import express from "express";

const router = express.Router(); // ✅ Correct

// ✅ E-commerce payments
router.post("/payment", newPayment);
router.get("/check-status", checkStatus);
router.post("/webhook",phonePeWebhook);

// router.post("/payment3", bookingTherapist);
// router.get("/check-status3", checkStatus3);
// router.get("/already-booked-Doctor", getBookedDoctorSlots)
export default router;
