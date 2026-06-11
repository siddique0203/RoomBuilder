import bcrypt from "bcryptjs";
import User from "../model/userModel.js";

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  return userObject;
};

const setUserSession = (req, user) => {
  req.session.userId = user._id.toString();
  req.session.username = user.username;
  req.session.fullname = user.fullname;
  req.session.email = user.email;
};

export const signup = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    const cleanFullname = fullname?.trim();
    const cleanUsername = username?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanFullname || !cleanUsername || !cleanEmail || !password) {
      return res.status(400).json({
        message: "Full name, username, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email or username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname: cleanFullname,
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    return res.status(201).json({
      message: "Signup successful. Please login.",
      user: sanitizeUser(savedUser),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error signing up",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isBcryptHash =
      user.password.startsWith("$2a$") ||
      user.password.startsWith("$2b$") ||
      user.password.startsWith("$2y$");

    const passwordMatches = isBcryptHash
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (!isBcryptHash) {
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }

    req.session.regenerate((regenerateError) => {
      if (regenerateError) {
        return res.status(500).json({
          message: "Could not create login session",
          error: regenerateError.message,
        });
      }

      setUserSession(req, user);

      req.session.save((saveError) => {
        if (saveError) {
          return res.status(500).json({
            message: "Could not save login session",
            error: saveError.message,
          });
        }

        return res.status(200).json({
          message: "Login successful",
          user: sanitizeUser(user),
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({
        message: "User session is invalid",
      });
    }

    return res.status(200).json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error checking session",
      error: error.message,
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Error logging out",
        error: error.message,
      });
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("roombuilder.sid", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  });
};