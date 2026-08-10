import dotenv from "dotenv";
import pkg from "pg-sdk-node";
import { Payment } from "../Models/PaymentSchema.js";
import { Product } from "../Models/ProductSchema.js";
const { StandardCheckoutClient, Env, StandardCheckoutPayRequest } = pkg;
import mongoose from "mongoose";
import { Booking } from "../Models/BookingSchema.js";
import { Bookingtherapist } from "../Models/BookTherapistSchema.js";
// import { Therapist } from "../Models/therapistSchema.js";

dotenv.config();

// const clientId = `SU2509251320096949558375`;
// const clientSecret = "dd9ccd0f-e7bd-4535-98ff-a729a1c7c896";

const clientId = `M235ZYM7NIZ42_2511131656`;
const clientSecret = "OGVlMzIyMmMtM2NmOS00N2U2LWI5ZDEtODEyZWM2MWVjMGEy";

const clientVersion = 1;
// const env = Env.PRODUCTION;
const env = Env.SANDBOX; // Use TEST environment for development

const client = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env,
);

export const newPayment = async (req, res) => {
  try {
    const { amount, MUID, transactionId, cartItems, usershipping, userId } =
      req.body;

    if (
      !userId ||
      !amount ||
      !usershipping ||
      !MUID ||
      !transactionId ||
      !cartItems
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const merchantOrderId = transactionId; // Use transactionId from frontend
    // const redirectUrl = `https://api2.darshsaree.com/api/phonepe/check-status?merchantOrderId=${merchantOrderId}`;
    const redirectUrl = `http://localhost:8001/api/phonepe/check-status?merchantOrderId=${merchantOrderId}`;

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amount * 100) // PhonePe expects amount in paise
      .redirectUrl(redirectUrl)
      .build();

    const response = await client.pay(request);
    if (response) {
      const orderConfirm = await Payment.create({
        marchentId: MUID,
        transactionId,
        amount,
        orderItems: cartItems,
        userId,
        userShipping: usershipping,
        payStatus: "Not Paid",
        orderAccept: false,
        orderReject: false,
        trackingId: "",
      });
    }
    console.log("Redirecting to PhonePe:", response.redirectUrl);

    // Send redirect URL to frontend
    res.status(200).json({ redirectUrl: response.redirectUrl });
  } catch (error) {
    console.error("Error in newPayment:", error.message);
    res.status(500).json({
      message: error,
      success: false,
    });
  }
};

export const checkStatus = async (req, res) => {
  // const frontendUrl = "https://www.pomwb.com";
  const frontendUrl = "http://localhost:3000";
  try {
    const { merchantOrderId } = req.query;
    console.log("Checking status for merchantOrderId:", merchantOrderId);
    if (!merchantOrderId) {
      return res.redirect(`${frontendUrl}/failure`);
    }

    // Get payment status from PhonePe
    const response = await client.getOrderStatus(merchantOrderId);
    const state = response.state;
    console.log("Order status from PhonePe:", state);

    // Find the payment record using merchantOrderId (transactionId)
    let orderConfirm = null;

    if (state === "COMPLETED") {
      orderConfirm = await Payment.findOneAndUpdate(
        { transactionId: merchantOrderId },
        { payStatus: "paid" },
        { new: true },
      );
    } else {
      orderConfirm = await Payment.findOne({ transactionId: merchantOrderId });
    }

    if (!orderConfirm) {
      console.log("❌ Payment not found for:", merchantOrderId);
      return res.redirect(`${frontendUrl}/failure`);
    }

    // Only update inventory if payment is successful
    if (state === "COMPLETED") {
      const cartItems = orderConfirm.orderItems;

      const findAndUpdateProduct = async (productId, qty) => {
        try {
          const objectId = new mongoose.Types.ObjectId(productId);
          const product = await Product.findById(objectId);

          if (!product) {
            console.log(`❌ Product not found: ${productId}`);
            return;
          }

          const newQty = (Number(product.stock) || 0) - qty;
          await Product.findByIdAndUpdate(
            objectId,
            { stock: newQty },
            { new: true },
          );
        } catch (error) {
          console.error("❌ Error updating product:", error.message);
        }
      };

      const updatePromises = cartItems.map((item) =>
        findAndUpdateProduct(item.productId, item.qty),
      );
      await Promise.all(updatePromises);
    }

    // Redirect based on status
    if (state === "COMPLETED") {
      return res.redirect(`${frontendUrl}/success`);
    } else {
      return res.redirect(`${frontendUrl}/failure`);
    }
  } catch (error) {
    console.error("Error in checkStatus:", error);
    return res.redirect(`${frontendUrl}/failure`);
  }
};

