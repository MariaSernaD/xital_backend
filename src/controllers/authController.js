import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (userId, name, role) => {
  return jwt.sign({ userId, name, role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const generateRefreshToken = (userId) => {
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_TOKEN, {
    expiresIn: "7d",
  });
  return { token: refreshToken, userId };
};

const generatePassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};
//verificación si el usuario ya existe en la base de datos, se usa el email
const verifyUserExists = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //verificar si el usuario existe
    const existingUser = await verifyUserExists(email);
    if (existingUser) {
     return res.status(400).json({ message: "User is already exists" });
    }

    const hashPassword = await generatePassword(password);
    const role = "customer";

    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role,
    });
    await newUser.save();
    res.status(201).json({
      message: `Register completed with name: ${name} and email: ${email}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
  
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //verificar que el usuario no exista
    const existingUser = await verifyUserExists(email);
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "User does not exist, you must be resgistered" });
    }
    //verificar que la contraseña que pone el usuario es la correcta(se compara con el hash de la BD)
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(
      existingUser._id,
      existingUser.name,
      existingUser.role,
    );
    const refreshToken = generateRefreshToken(existingUser._id);
    res.status(200).json({ token, refreshToken: refreshToken.token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { register, login };
