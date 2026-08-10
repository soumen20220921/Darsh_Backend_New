
import express from "express";
import {  getAllBookings, getBookingById } from "../Controllers/booking.js";
import { Authenticated } from "../Middlewares/Auth.js";

const router = express();

router.get("/getBookingById",Authenticated,getBookingById );
router.get("/allbookings", getAllBookings);

export default router;
