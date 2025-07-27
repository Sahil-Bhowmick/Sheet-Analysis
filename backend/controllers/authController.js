import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Resend } from "resend";
import crypto from "crypto";
import { adminAuth } from "../utils/firebaseAdmin.js";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);
// 🔐 JWT Generator
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// 1️⃣ Register
export const register = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({ message: "Registered successfully", token, role });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Registration failed", error: err.message });
  }
};

// 2️⃣ Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.status(200).json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// 3️⃣ Google Login via Firebase
export const firebaseLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const { email, name } = decoded;

    if (!email || !name)
      return res.status(400).json({ message: "Invalid Firebase token" });

    let user = await User.findOne({ email });

    if (!user) {
      const dummyPassword = await bcrypt.hash(email + "firebase", 10);
      user = new User({ name, email, password: dummyPassword, role: "user" });
      await user.save();
    }

    const token = generateToken(user);
    res.status(200).json({ token, role: user.role });
  } catch (err) {
    console.error("Firebase login error:", err);
    res.status(401).json({ message: "Firebase login failed" });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    await resend.emails.send({
      from: "Sheet Analysis App <support@sheet-analysis.com>", // ✅ Must be verified
      to: [email],
      subject: "Reset Your Password",
      html: `<p>You requested a password reset</p>
             <p>Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json({ message: "Reset link sent to email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
