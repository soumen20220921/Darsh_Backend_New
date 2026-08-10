// import { Therapist } from "../Models/therapistSchema.js";


// export const getTheraistBookingById = async (req, res) => {
//   const userId = req.user?._id.toString();
//   if (!userId) {
//     return res.json({ message: "User not found", success: false });
//   }
//   // console.log(userId)
//   try {
//     let orders = await Therapist.find({ userId: userId }).sort({ orderDate: -1 });
//     // console.log(orders)
//     // console.log(orders)
//     res.json({ message: "Fetched all Therapist bookings successfully",
//       success: true,orders});
//   } catch (error) {
//     console.log(error);
//   }
// };

// // get all orders

// export const getAllTherapistBookings = async (req, res) => {
//   try {
//     const allOrders = await Therapist.find();
//     res.json({
//       message: "Fetched all Therapist bookings successfully",
//       success: true,
//       allOrders,
//     });
//   } catch (error) {
//     res.json({ message: error.message, success: false });
//   }
// };