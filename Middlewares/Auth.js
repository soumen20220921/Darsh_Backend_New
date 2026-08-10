import jwt from "jsonwebtoken";
import { User } from "../Models/UserSchema.js";

export const Authenticated = async (req, res, next) => {
    try {
        const token = req.header("Auth");
        if (!token) return res.json({ message: "Login First", success: false });
        const decoded = jwt.verify(token, "!@#$%^&*()");
        const id = decoded.userId
        const user = await User.findById(id);
        req.user = user;
        next();
    } catch (error) {
        res.json({ message: "Invalid token", success: false });
    }
}