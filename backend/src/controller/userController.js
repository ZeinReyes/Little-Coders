import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // ✅ add jwt import

// ==============================
// GET all users
// ==============================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ==============================
// GET user by ID
// ==============================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ==============================
// LOGIN USER
// ==============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    // Send user info + token
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasCompletedOnboarding: user.hasCompletedOnboarding, // ✅ include onboarding status
    };

    res.json({
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// ==============================
// ADD new user
// ==============================
export const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      hasCompletedOnboarding: false,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    // Send user (without password) and token
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      hasCompletedOnboarding: newUser.hasCompletedOnboarding
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ==============================
// UPDATE user
// ==============================
export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ==============================
// DELETE user
// ==============================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ==============================
// GET onboarding status
// ==============================
export const getOnboardingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("hasCompletedOnboarding");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ hasCompletedOnboarding: user.hasCompletedOnboarding });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ==============================
// MARK onboarding as complete
// ==============================
export const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.hasCompletedOnboarding = true;
    await user.save();

    res.json({ message: "Onboarding marked as complete", user });
  } catch (err) {
    console.error("Error updating onboarding:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ==============================
// RESET onboarding
// ==============================
export const resetOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.hasCompletedOnboarding = false;
    await user.save();

    res.json({ message: "Onboarding reset", hasCompletedOnboarding: false });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
