import express from "express";
import { allusers, login, profile, register } from "../Controllers/user.js";
import { Authenticated } from "../Middlewares/Auth.js";
const router = express.Router();

// register user
router.post("/register", register);
router.post("/login", login);
router.get("/allusers", allusers);
router.get("/profile", Authenticated, profile);

export default router;
