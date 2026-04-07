import {firebaseApp} from "../firebaseAdmin.js";
import {getAuth} from 'firebase-admin/auth'
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await getAuth(firebaseApp).verifyIdToken(token);

    req.user = {
      id: decodedToken.user_id,
      email: decodedToken.email,
      role: decodedToken.role ?? "user",
    };

    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

