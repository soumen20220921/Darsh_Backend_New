import express from "express"
import { addAddress, getAddressByID, updateAddress } from "../Controllers/shippingAddress.js";
import { Authenticated } from "../Middlewares/Auth.js";

const router = express.Router();

router.post("/addAddress", Authenticated, addAddress);
router.get("/getAddressById", Authenticated, getAddressByID);
router.put("/updateAddress/:id", Authenticated, updateAddress);

export default router;
