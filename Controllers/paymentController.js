import dotenv from "dotenv";
import pkg from "@phonepe-pg/pg-sdk-node";
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

// export const newPayment = async (req, res) => {
//   try {
//     const { amount, MUID, transactionId, cartItems, usershipping, userId } =
//       req.body;

//     if (
//       !userId ||
//       !amount ||
//       !usershipping ||
//       !MUID ||
//       !transactionId ||
//       !cartItems
//     ) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const merchantOrderId = transactionId; // Use transactionId from frontend
//     // const redirectUrl = `https://api2.darshsaree.com/api/phonepe/check-status?merchantOrderId=${merchantOrderId}`;
//     const redirectUrl = `http://localhost:8001/api/phonepe/check-status?merchantOrderId=${merchantOrderId}`;

//     const request = StandardCheckoutPayRequest.builder()
//       .merchantOrderId(merchantOrderId)
//       .amount(amount * 100) // PhonePe expects amount in paise
//       .redirectUrl(redirectUrl)
//       .build();

//     const response = await client.pay(request);
//     if (response) {
//       const orderConfirm = await Payment.create({
//         marchentId: MUID,
//         transactionId,
//         amount,
//         orderItems: cartItems,
//         userId,
//         userShipping: usershipping,
//         payStatus: "Not Paid",
//         orderAccept: false,
//         orderReject: false,
//         trackingId: "",
//       });
//     }
//     console.log("Redirecting to PhonePe:", response.redirectUrl);

//     // Send redirect URL to frontend
//     res.status(200).json({ redirectUrl: response.redirectUrl });
//   } catch (error) {
//     console.error("Error in newPayment:", error.message);
//     res.status(500).json({
//       message: error,
//       success: false,
//     });
//   }
// };

// export const checkStatus = async (req, res) => {
//   // const frontendUrl = "https://www.pomwb.com";
//   const frontendUrl = "http://localhost:3000";
//   try {
//     const { merchantOrderId } = req.query;
//     console.log("Checking status for merchantOrderId:", merchantOrderId);
//     if (!merchantOrderId) {
//       return res.redirect(`${frontendUrl}/failure`);
//     }

//     // Get payment status from PhonePe
//     const response = await client.getOrderStatus(merchantOrderId);
//     const state = response.state;
//     console.log("Order status from PhonePe:", state);

//     // Find the payment record using merchantOrderId (transactionId)
//     let orderConfirm = null;

//     if (state === "COMPLETED") {
//       orderConfirm = await Payment.findOneAndUpdate(
//         { transactionId: merchantOrderId },
//         { payStatus: "paid" },
//         { new: true },
//       );
//     } else {
//       orderConfirm = await Payment.findOne({ transactionId: merchantOrderId });
//     }

//     if (!orderConfirm) {
//       console.log("❌ Payment not found for:", merchantOrderId);
//       return res.redirect(`${frontendUrl}/failure`);
//     }

//     // Only update inventory if payment is successful
//     if (state === "COMPLETED") {
//       const cartItems = orderConfirm.orderItems;

//       const findAndUpdateProduct = async (productId, qty) => {
//         try {
//           const objectId = new mongoose.Types.ObjectId(productId);
//           const product = await Product.findById(objectId);

//           if (!product) {
//             console.log(`❌ Product not found: ${productId}`);
//             return;
//           }

//           const newQty = (Number(product.stock) || 0) - qty;
//           await Product.findByIdAndUpdate(
//             objectId,
//             { stock: newQty },
//             { new: true },
//           );
//         } catch (error) {
//           console.error("❌ Error updating product:", error.message);
//         }
//       };

//       const updatePromises = cartItems.map((item) =>
//         findAndUpdateProduct(item.productId, item.qty),
//       );
//       await Promise.all(updatePromises);
//     }

//     // Redirect based on status
//     if (state === "COMPLETED") {
//       return res.redirect(`${frontendUrl}/success`);
//     } else {
//       return res.redirect(`${frontendUrl}/failure`);
//     }
//   } catch (error) {
//     console.error("Error in checkStatus:", error);
//     return res.redirect(`${frontendUrl}/failure`);
//   }
// };


// ======================================================
// CREATE PAYMENT
// ======================================================

export const newPayment = async (req, res) => {
  try {
    const {
      amount,
      MUID,
      transactionId,
      cartItems,
      usershipping,
      userId,
    } = req.body;

    // -----------------------------------------------
    // Validate request
    // -----------------------------------------------

    if (
      !userId ||
      !amount ||
      !usershipping ||
      !MUID ||
      !transactionId ||
      !cartItems
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }


    // -----------------------------------------------
    // Check duplicate transaction
    // -----------------------------------------------

    const existingPayment = await Payment.findOne({
      transactionId,
    });

    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: "Payment already exists",
        transactionId,
        payStatus: existingPayment.payStatus,
      });
    }


    // -----------------------------------------------
    // PhonePe merchant order ID
    // -----------------------------------------------

    const merchantOrderId = transactionId;


    // -----------------------------------------------
    // IMPORTANT:
    // This URL is only for browser redirect.
    //
    // It is NOT the webhook.
    // -----------------------------------------------

    const redirectUrl =`http://localhost:8001/api/phonepe/check-status?merchantOrderId=${merchantOrderId}`;


    // -----------------------------------------------
    // Create PhonePe request
    // -----------------------------------------------

    const request =
      StandardCheckoutPayRequest
        .builder()
        .merchantOrderId(merchantOrderId)
        .amount(Number(amount) * 100)
        .redirectUrl(redirectUrl)
        .build();


    // -----------------------------------------------
    // Create PhonePe payment
    // -----------------------------------------------

    const response = await client.pay(request);


    if (!response || !response.redirectUrl) {
      return res.status(500).json({
        success: false,
        message: "PhonePe payment URL was not generated",
      });
    }


    // -----------------------------------------------
    // Save payment in DB
    // -----------------------------------------------

    await Payment.create({
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


    console.log(
      "PhonePe payment created:",
      merchantOrderId
    );


    // -----------------------------------------------
    // Send checkout URL to frontend
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      redirectUrl: response.redirectUrl,
      merchantOrderId,
    });

  } catch (error) {

    console.error(
      "Error in newPayment:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// UPDATE STOCK
// ======================================================

const updateInventory = async (cartItems) => {

  if (!Array.isArray(cartItems)) {
    console.log(
      "No cart items found for inventory update"
    );

    return;
  }


  for (const item of cartItems) {

    try {

      const productId = item.productId;
      const qty = Number(item.qty) || 0;

      if (!productId || qty <= 0) {
        continue;
      }


      const objectId =
        new mongoose.Types.ObjectId(productId);


      // ------------------------------------------------
      // Atomic stock decrement
      // ------------------------------------------------

      const product =
        await Product.findOneAndUpdate(
          {
            _id: objectId,

            // Prevent stock from becoming negative
            stock: {
              $gte: qty,
            },
          },
          {
            $inc: {
              stock: -qty,
            },
          },
          {
            new: true,
          }
        );


      if (!product) {

        console.log(
          `❌ Product not found or insufficient stock: ${productId}`
        );

        continue;
      }


      console.log(
        `✅ Stock updated: ${productId}, remaining stock: ${product.stock}`
      );

    } catch (error) {

      console.error(
        `❌ Error updating product ${item.productId}:`,
        error.message
      );
    }
  }
};


// ======================================================
// FINALIZE PAYMENT
// ======================================================
//
// THIS IS THE MOST IMPORTANT FUNCTION.
//
// Both:
//
// 1. checkStatus()
// 2. webhook()
//
// call this function.
//
// It makes the payment processing idempotent.
// ======================================================

const finalizePayment = async (merchantOrderId) => {

  console.log(
    "Finalizing payment:",
    merchantOrderId
  );


  // ----------------------------------------------------
  // Find payment
  // ----------------------------------------------------

  const payment = await Payment.findOne({
    transactionId: merchantOrderId,
  });


  if (!payment) {

    console.log(
      "❌ Payment not found:",
      merchantOrderId
    );

    return {
      success: false,
      reason: "PAYMENT_NOT_FOUND",
    };
  }


  // ----------------------------------------------------
  // VERY IMPORTANT
  //
  // If already paid, DO NOT reduce stock again.
  // ----------------------------------------------------

  if (payment.payStatus === "paid") {

    console.log(
      "✅ Payment already processed:",
      merchantOrderId
    );

    return {
      success: true,
      alreadyProcessed: true,
      payment,
    };
  }


  // ----------------------------------------------------
  // Update payment status
  // ----------------------------------------------------

  payment.payStatus = "paid";

  await payment.save();


  console.log(
    "✅ Payment marked as PAID:",
    merchantOrderId
  );


  // ----------------------------------------------------
  // Update inventory
  // ----------------------------------------------------

  await updateInventory(
    payment.orderItems
  );


  console.log(
    "✅ Inventory processed:",
    merchantOrderId
  );


  return {
    success: true,
    alreadyProcessed: false,
    payment,
  };
};


// ======================================================
// CHECK PHONEPE STATUS
// ======================================================

export const checkStatus = async (req, res) => {

  // const frontendUrl = "https://www.pomwb.com";
  const frontendUrl = "http://localhost:3000";

  try {

    const {
      merchantOrderId,
    } = req.query;


    console.log(
      "Checking PhonePe status:",
      merchantOrderId
    );


    if (!merchantOrderId) {

      return res.redirect(
        `${frontendUrl}/failure`
      );
    }


    // --------------------------------------------------
    // Call PhonePe Check Status API
    // --------------------------------------------------

    const response =
      await client.getOrderStatus(
        merchantOrderId
      );


    const state = response.state;


    console.log(
      "PhonePe Order State:",
      state
    );


    // --------------------------------------------------
    // COMPLETED
    // --------------------------------------------------

    if (state === "COMPLETED") {

      const result =
        await finalizePayment(
          merchantOrderId
        );


      if (!result.success) {

        return res.redirect(
          `${frontendUrl}/failure`
        );
      }


      return res.redirect(
        `${frontendUrl}/success`
      );
    }


    // --------------------------------------------------
    // FAILED
    // --------------------------------------------------

    if (
      state === "FAILED" ||
      state === "DECLINED"
    ) {

      await Payment.findOneAndUpdate(
        {
          transactionId: merchantOrderId,

          // Don't overwrite a successful payment
          payStatus: {
            $ne: "paid",
          },
        },
        {
          payStatus: "failed",
        }
      );


      return res.redirect(
        `${frontendUrl}/failure`
      );
    }


    // --------------------------------------------------
    // PENDING / PROCESSING
    // --------------------------------------------------

    console.log(
      "Payment still pending:",
      state
    );


    return res.redirect(
      `${frontendUrl}/payment-pending`
    );

  } catch (error) {

    console.error(
      "❌ Error in checkStatus:",
      error
    );


    return res.redirect(
      `${frontendUrl}/failure`
    );
  }
};


// ======================================================
// PHONEPE WEBHOOK
// ======================================================
//
// PhonePe -> Your Backend
//
// This works even when customer's browser/internet
// connection is gone.
// ======================================================

export const phonePeWebhook = async (req, res) => {

  try {

    console.log(
      "======================================"
    );

    console.log(
      "📩 PhonePe Webhook Received"
    );

    console.log(
      "======================================"
    );


    // --------------------------------------------------
    // PhonePe sends authorization information
    // in the request header.
    // --------------------------------------------------

    const authorization =
      req.headers.authorization;


    if (!authorization) {

      console.log(
        "❌ Missing PhonePe authorization header"
      );

      return res.status(401).json({
        success: false,
        message: "Missing authorization",
      });
    }


    // --------------------------------------------------
    // IMPORTANT:
    //
    // validateCallback() requires the EXACT body
    // string received from PhonePe.
    // --------------------------------------------------

    const responseBodyString =
      Buffer.isBuffer(req.body)
        ? req.body.toString("utf8")
        : JSON.stringify(req.body);


    console.log(
      "Webhook body:",
      responseBodyString
    );


    // --------------------------------------------------
    // Validate PhonePe callback
    // --------------------------------------------------

    const callbackResponse =
      client.validateCallback(
       pomwb_webhook,
       POMWBWebhook2026X7,
        authorization,
        responseBodyString
      );


    console.log(
      "✅ PhonePe callback verified"
    );


    // --------------------------------------------------
    // Extract callback information
    // --------------------------------------------------

    const payload =
      callbackResponse.payload;


    const state =
      payload?.state;


    // Depending on callback version,
    // order ID is generally available as orderId.
    //
    // We also check merchantOrderId for compatibility.
    const merchantOrderId =
      payload?.orderId ||
      payload?.merchantOrderId;


    console.log(
      "Webhook order ID:",
      merchantOrderId
    );

    console.log(
      "Webhook state:",
      state
    );


    if (!merchantOrderId) {

      console.log(
        "❌ Merchant order ID missing"
      );

      return res.status(400).json({
        success: false,
        message: "Merchant order ID missing",
      });
    }


    // --------------------------------------------------
    // COMPLETED
    // --------------------------------------------------

    if (state === "COMPLETED") {

      const result =
        await finalizePayment(
          merchantOrderId
        );


      if (!result.success) {

        console.log(
          "❌ Could not finalize payment"
        );

        return res.status(200).json({
          success: false,
          message: "Payment record not found",
        });
      }


      console.log(
        "✅ Payment completed through webhook:",
        merchantOrderId
      );
    }


    // --------------------------------------------------
    // FAILED
    // --------------------------------------------------

    else if (
      state === "FAILED" ||
      state === "DECLINED"
    ) {

      await Payment.findOneAndUpdate(
        {
          transactionId: merchantOrderId,

          payStatus: {
            $ne: "paid",
          },
        },
        {
          payStatus: "failed",
        }
      );


      console.log(
        "❌ Payment failed:",
        merchantOrderId
      );
    }


    // --------------------------------------------------
    // PENDING / PROCESSING
    // --------------------------------------------------

    else {

      console.log(
        "⏳ Payment still processing:",
        state
      );
    }


    // --------------------------------------------------
    // IMPORTANT
    //
    // Tell PhonePe webhook was received.
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
    });

  } catch (error) {

    console.error(
      "❌ PhonePe webhook error:",
      error
    );


    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};
