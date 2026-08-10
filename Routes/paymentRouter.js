import express from "express";
import {
  checkout,
  getAllOrders,
  getOrderById,
  //   verify,
  getOrderByOrderIdAndUpdate,
  addTrackingId,
  rezorpayWebhook,
} from "../Controllers/payment.js";
import { Authenticated } from "../Middlewares/Auth.js";
const router = express.Router();

// checkout
router.post("/checkout", checkout);

// verify
// router.post("/verify", verify);

// get order by id

router.get("/getOrderById", Authenticated, getOrderById);

// get all orders

router.get("/getallorders", getAllOrders);

// get order by order id and update

router.put("/dispatch/:id", getOrderByOrderIdAndUpdate);

// add tracking id

router.put("/addTrackingId/:id", addTrackingId);

router.post("/verification", rezorpayWebhook);

export default router;
