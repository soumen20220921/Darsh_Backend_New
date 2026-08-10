import  { Booking } from "../Models/BookingSchema.js";

export const getBookingById = async (req, res) => {
  const userId = req.user?._id.toString();
  if (!userId) {
    return res.json({ message: "User not found", success: false });
  }
  // console.log(userId)
  try {
    let orders = await Booking.find({ userId: userId }).sort({ orderDate: -1 });
    // console.log(orders)
    // console.log(orders)
    res.json({ message: "Fetched all bookings successfully",
      success: true,orders});
  } catch (error) {
    console.log(error);
  }
};

// get all orders

export const getAllBookings = async (req, res) => {
  try {
    const allOrders = await Booking.find();
    res.json({
      message: "Fetched all bookings successfully",
      success: true,
      allOrders,
    });
  } catch (error) {
    res.json({ message: error.message, success: false });
  }
};