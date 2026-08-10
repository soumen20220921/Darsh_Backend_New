import express from "express"
import { addToCart, clearcart, decreaseQtyFromCart, removeProductfromcart, userCart } from "../Controllers/cart.js";
import { Authenticated } from "../Middlewares/Auth.js";
const router = express.Router();

router.post("/addToCart", Authenticated, addToCart);
router.get("/userCart", Authenticated, userCart);
router.delete("/remove/:productId", Authenticated, removeProductfromcart);
router.delete("/clearCart", Authenticated, clearcart);
router.post("/decreaseQtyFromCart", Authenticated, decreaseQtyFromCart);


export default router;