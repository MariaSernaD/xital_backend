import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  let authenticatedToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      authenticatedToken = req.headers["authorization"]?.split(" ")[1];
      if (!authenticatedToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const decoded = jwt.verify(authenticatedToken, process.env.JWT_SECRET);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Not authorized or token failed" });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized, no token provided" });
  }
};

export default authMiddleware;
