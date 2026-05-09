import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "123456";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // attach user info
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};