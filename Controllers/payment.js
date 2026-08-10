import { Payment } from "../Models/PaymentSchema.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Product } from "../Models/ProductSchema.js";
import mongoose from "mongoose";
const razorpay = new Razorpay({
  // didi api key
  key_id: "rzp_live_UVshYgtn2fCscP",
  key_secret: "ueaQWLTjMKMil21HvTjwC9K5",
  // my api key
  //   key_id: "rzp_live_OQ2nE2U6mFXDKF",
  //   key_secret: "3u392dESvYIFxryfe5f5j3zt",
  // testing api key
  // key_id: "rzp_test_b2ELVX63W37hP4",
  // key_secret: "Ku6chmNdlLPHiLnTvIQpo8Uq",
});

export const checkout = async (req, res) => {
  const { amount, cartItems, usershipping, userId } = req.body;

  console.log(cartItems);
  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: {
      amount,
      cartItems,
      usershipping,
      userId,
    },
  };

  try {
    // console.log("hi")
    const order = await razorpay.orders.create(options);
    // console.log("Order created:", order);
    // console.log("Sending response...");

    res.json({
      message: "Order created successfully",
      orderId: order.id,
      amount: amount,
      cartItems,
      usershipping,
      userId,
      payStatus: "created",
    });

    // console.log("Response sent.");
  } catch (error) {
    console.log("Error creating Razorpay order:", error);
  }
};

// export const verify = async (req, res) => {
//   const {
//     orderId,
//     paymentId,
//     signature,
//     amount,
//     orderItems,
//     userId,
//     userShipping,
//   } = req.body;
//   try {
//     const orderConfirm = await Payment.create({
//       orderId,
//       paymentId,
//       signature,
//       amount,
//       orderItems,
//       userId,
//       userShipping,
//       payStatus: "paid",
//       orderAccept: false,
//       orderReject: false,
//       trackingId: "",
//     });
//     res.json({ message: "payment successfull..", success: true, orderConfirm });
//   } catch (error) {
//     console.log(error);
//     res.json({ message: "Something went wrong", success: false });
//   }
// };

// get order by Id

export const getOrderById = async (req, res) => {
  const userId = req.user?._id.toString();
  if (!userId) {
    return res.json({ message: "User not found", success: false });
  }
  // console.log(userId)
  try {
    let orders = await Payment.find({ userId: userId }).sort({ orderDate: -1 });
    // console.log(orders)
    // console.log(orders)
    res.json({ message: "Fetched all order successfully",
      success: true,orders});
  } catch (error) {
    console.log(error);
  }
};

// get all orders

export const getAllOrders = async (req, res) => {
  try {
    const allOrders = await Payment.find();
    res.json({
      message: "Fetched all order successfully",
      success: true,
      allOrders,
    });
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};

// get order by order id and update

export const getOrderByOrderIdAndUpdate = async (req, res) => {
  const id = req.params?.id;
  try {
    const order = await Payment.findByIdAndUpdate(id, req.body, { new: true });
    if (!order) return res.json({ message: "Order not found", success: false });
    res.json({ message: "Updated Successfully", success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ message: "Something went wrong", success: false });
  }
};

// add tracking ID

export const addTrackingId = async (req, res) => {
  const id = req.params?.id;
  if (!id) {
    return res
      .status(400)
      .json({ message: "Order ID is required", success: false });
  }
  try {
    const order = await Payment.findByIdAndUpdate(id, req.body, { new: true });
    if (!order) return res.json({ message: "Order not found", success: false });
    res.json({ message: "Updated Successfully", success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ message: "Something went wrong", success: false });
  }
};

export const rezorpayWebhook = async (req, res) => {
  const secret = "123456"; // Replace with actual webhook secret

  try {
    // Verify Webhook Signature
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");
    console.log(digest);
    console.log(req.headers["x-razorpay-signature"]);

    if (digest !== req.headers["x-razorpay-signature"]) {
      console.log("❌ Invalid webhook signature");
      return res
        .status(400)
        .json({ status: "error", message: "Invalid signature" });
    }

    // console.log("✅ Webhook Signature Verified");

    const paymentData = req.body.payload.payment?.entity?.notes;

    if (!paymentData) {
      console.log("❌ Missing paymentData");
      return res
        .status(400)
        .json({ status: "error", message: "Invalid payment data" });
    }

    const { amount, cartItems, usershipping, userId } = paymentData;

    const orderConfirm = await Payment.create({
      orderId: paymentData.order_id,
      paymentId: paymentData.id,
      signature: req.headers["x-razorpay-signature"],
      amount,
      orderItems: cartItems,
      userId,
      userShipping: usershipping,
      payStatus: "paid",
      orderAccept: false,
      orderReject: false,
      trackingId: "",
    });

    if (orderConfirm) {
      // console.log("✅ Order stored in database:", orderConfirm);

      // Define function to update product quantity
      const findAndUpdateProduct = async (productId, qty) => {
        try {
          const objectId = new mongoose.Types.ObjectId(productId);

          const previousProduct = await Product.findById(objectId);

          if (!previousProduct) {
            console.log(`❌ Product not found: ${productId}`);
            return;
          }

          // console.log("🔍 Previous Product:", previousProduct);

          const currentQuantity = Number(previousProduct.Quantity) || 0;

          if (currentQuantity < qty) {
            // console.log(`❌ Not enough stock for product: ${productId}`);
            return;
          }

          const quantityNow = currentQuantity - qty;

          // Update product quantity
          const updatedProduct = await Product.findByIdAndUpdate(
            objectId,
            { Quantity: quantityNow },
            { new: true }
          );

          // console.log("✅ Updated Product:", updatedProduct);
        } catch (error) {
          console.error("❌ Error updating product:", error);
        }
      };

      // Ensure correct ID field in cartItems
      const updatePromises = cartItems.map((item) =>
        findAndUpdateProduct(item.productId, item.qty)
      );

      await Promise.all(updatePromises);
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("❌ Error processing Razorpay Webhook:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
