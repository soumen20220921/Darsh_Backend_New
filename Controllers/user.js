import { User } from "../Models/UserSchema.js";
// import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//api for register user
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let uniqueEmail = await User.findOne({ email });
    if (uniqueEmail)
      return res.json({ message: "Email already exist.", success: false });
    // Await the bcrypt.hash call to get the hashed password
    // const hashpass = await bcrypt.hash(password, 10);
    // Create the user with the hashed password
    let user = await User.create({ name, email, password });
    res.send({ message: "User registered successfully!", success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
};

//api for login user
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    // console.log(user);
    if (!user) return res.json({ message: "User not found!", success: false });
    if (user.password !== password)
      return res.json({ message: "Invalid password!", success: false });
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) return res.json({ message: "Invalid password!", success: false })
    // Generate a token
    const token = jwt.sign({ userId: user._id }, "!@#$%^&*()", {
      expiresIn: "365d",
    });
    res.json({
      message: "User logged in successfully!",
      token,
      user,
      success: true,
    });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
};

//api for alluser

export const allusers = async (req, res) => {
  try {
    let users = await User.find();
    res.json({ message: "These are all users", users });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
};

// get profile

export const profile = async (req, res) => {
  try {
    const profile = req.user;
    res.json({ message: "User profile", success: true, profile });
  } catch (error) {
    res.json({ message: "User not found", success: false, success: false });
  }
};
