import dotenv from "dotenv";
import pkg from "@phonepe-pg/pg-sdk-node";
import { Payment } from "../Models/PaymentSchema.js";
import { Product } from "../Models/ProductSchema.js";
const { StandardCheckoutClient, Env, StandardCheckoutPayRequest } = pkg;
import mongoose from "mongoose";
import { Booking } from "../Models/BookingSchema.js";
import { Bookingtherapist } from "../Models/BookTherapistSchema.js";
// import { Therapist } from "../Models/therapistSchema.js";
import crypto from "crypto";
dotenv.config();


// const clientId =  "SU2504171113504711108609";
// const clientSecret =  "420f2f0e-41ed-4ba2-ab26-9a3bc8216460";
const clientId = `DARSHONLINE_260828103338`;
const clientSecret = "NDc3NDM1ZTItYjc2Yy00MTQ3LWFiZWUtMzg3YWU5MWZhYWRi";

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
//   const frontendUrl = "https://www.darshsaree.in";
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

    const redirectUrl =`https://api.darshsaree.in/api/phonepe/check-status?merchantOrderId=${merchantOrderId}`;


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
  const frontendUrl = "https://www.darshsaree.in";

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

// PhonePe -> Your Backend

// This works even when customer's browser/internet
// connection is gone.
// ======================================================




export const phonePeWebhook = async (req, res) => {
console.log("\n======================================");
console.log("🔥 PHONEPE WEBHOOK HIT");
console.log("======================================");

try {
// ==========================================
// 1. LOG REQUEST INFORMATION
// ==========================================

console.log("BODY:", req.body);
console.log("RAW BODY:", req.rawBody);

const authorization = req.headers.authorization;

console.log("Authorization received:", !!authorization);
console.log(
  "Authorization length:",
  authorization ? authorization.length : 0
);

// ==========================================
// 2. CHECK AUTHORIZATION HEADER
// ==========================================

if (!authorization) {
  console.log("❌ Missing PhonePe authorization header");

  return res.status(401).json({
    success: false,
    message: "Missing authorization",
  });
}

// ==========================================
// 3. CHECK RAW BODY
// ==========================================

const responseBodyString = req.rawBody;

if (!responseBodyString) {
  console.log("❌ Raw webhook body missing");

  return res.status(400).json({
    success: false,
    message: "Raw body missing",
  });
}

console.log("Raw webhook body:", responseBodyString);

// ==========================================
// 4. PHONEPE WEBHOOK CREDENTIALS
// ==========================================

const webhookUsername = "DARSH";
const webhookPassword = "Darsh2026x7";

// ==========================================
// 5. DEBUG AUTHORIZATION
// ==========================================

const expectedAuthorization = crypto
  .createHash("sha256")
  .update(`${webhookUsername}:${webhookPassword}`)
  .digest("hex");

console.log("\n========== PHONEPE AUTH DEBUG ==========");
console.log(
  "Received Authorization length:",
  authorization.length
);
console.log(
  "Expected Authorization length:",
  expectedAuthorization.length
);
console.log(
  "Authorization matches:",
  authorization === expectedAuthorization
);
console.log("========================================\n");

// ==========================================
// 6. VALIDATE PHONEPE CALLBACK
// ==========================================

const callbackResponse = client.validateCallback(
  webhookUsername,
  webhookPassword,
  authorization,
  responseBodyString
);

console.log("✅ PhonePe callback verified");

// ==========================================
// 7. GET PAYLOAD
// ==========================================

const payload = callbackResponse?.payload;

if (!payload) {
  console.log("❌ PhonePe payload missing");

  return res.status(400).json({
    success: false,
    message: "Payload missing",
  });
}

console.log("PhonePe payload:", payload);

// ==========================================
// 8. EXTRACT PAYMENT INFORMATION
// ==========================================

const state = payload?.state;

// IMPORTANT:
// merchantOrderId = YOUR transaction ID
// orderId = PHONEPE internal order ID

const merchantOrderId = payload?.merchantOrderId;
const phonePeOrderId = payload?.orderId;

const amount = payload?.amount;

console.log("\n========== PAYMENT DETAILS ==========");
console.log("Merchant Order ID:", merchantOrderId);
console.log("PhonePe Order ID:", phonePeOrderId);
console.log("Payment State:", state);
console.log("Amount:", amount);
console.log("=====================================\n");

// ==========================================
// 9. CHECK MERCHANT ORDER ID
// ==========================================

if (!merchantOrderId) {
  console.log("❌ Merchant Order ID missing");

  return res.status(400).json({
    success: false,
    message: "Merchant order ID missing",
  });
}

// ==========================================
// 10. PAYMENT COMPLETED
// ==========================================

if (state === "COMPLETED") {
  console.log(
    "💰 PAYMENT COMPLETED THROUGH WEBHOOK:",
    merchantOrderId
  );

  try {
    // Use merchantOrderId, NOT PhonePe orderId
    const result = await finalizePayment(merchantOrderId);

    if (!result?.success) {
      console.log(
        "❌ Could not finalize payment:",
        result?.reason
      );

      // If payment doesn't exist, don't keep retrying forever
      return res.status(200).json({
        success: false,
        message: "Payment record not found",
      });
    }

    console.log(
      "✅ PAYMENT SUCCESSFULLY FINALIZED:",
      merchantOrderId
    );

    console.log(
      "✅ Webhook payment processing completed"
    );

  } catch (finalizeError) {
    console.error(
      "❌ Error while finalizing payment:",
      finalizeError
    );

    // Return 500 so PhonePe can retry webhook
    return res.status(500).json({
      success: false,
      message: "Payment finalization failed",
    });
  }
}

// ==========================================
// 11. PAYMENT FAILED
// ==========================================

else if (
  state === "FAILED" ||
  state === "DECLINED"
) {
  console.log(
    "❌ PAYMENT FAILED THROUGH WEBHOOK:",
    merchantOrderId
  );

  try {
    const result = await Payment.findOneAndUpdate(
      {
        transactionId: merchantOrderId,
        payStatus: {
          $ne: "paid",
        },
      },
      {
        $set: {
          payStatus: "failed",
        },
      },
      {
        new: true,
      }
    );

    if (result) {
      console.log(
        "✅ Payment marked as FAILED:",
        merchantOrderId
      );
    } else {
      console.log(
        "⚠️ Payment not found or already paid:",
        merchantOrderId
      );
    }

  } catch (error) {
    console.error(
      "❌ Error updating failed payment:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed payment processing error",
    });
  }
}

// ==========================================
// 12. PAYMENT PENDING / OTHER STATES
// ==========================================

else {
  console.log(
    "⏳ Payment not completed yet"
  );

  console.log("State:", state);
  console.log("Merchant Order ID:", merchantOrderId);
}

// ==========================================
// 13. ACKNOWLEDGE PHONEPE WEBHOOK
// ==========================================

console.log(
  "📨 Sending webhook acknowledgement"
);

return res.status(200).json({
  success: true,
});

} catch (error) {

console.error("\n======================================");
console.error("❌ PHONEPE WEBHOOK ERROR");
console.error("======================================");

console.error("Error name:", error?.name);
console.error("Error message:", error?.message);
console.error("Full error:", error);

// Return 500 so PhonePe can retry
return res.status(500).json({
  success: false,
  message: "Webhook processing failed",
});

}
};