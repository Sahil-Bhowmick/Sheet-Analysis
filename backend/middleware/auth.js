import jwt from "jsonwebtoken";

// ✅ Verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers?.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.id;
    next();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("JWT error:", err.message);
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Allow only admin users
export const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
