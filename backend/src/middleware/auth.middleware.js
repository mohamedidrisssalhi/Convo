import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  console.log('PROTECT ROUTE HIT');
  console.log('req.headers.authorization:', req.headers.authorization);
  try {
    let token = null;
    // Check Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      console.log('Unauthorized - No Token Provided');
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      console.log('Unauthorized - Invalid Token');
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Support both { id } and { userId } in payload
    const userId = decoded.id || decoded.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default protectRoute;
