import jwt from 'jsonwebtoken';
import express from 'express';
import User from "../models/User.js";
import bcrypt from "bcrypt";



const router = express.Router();



const JWT_SECRET = 'your-jwt-secret-key';

router.post("/signup",async(req,res) => {
    try {
    const { name, email, password, age } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    // const bcrypt = (await import("bcrypt")).default;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age,
    });

    await newUser.save();

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});


// Login route - generate token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Find user by email only
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Compare hashed password
  // const bcrypt = (await import("bcrypt")).default;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Create payload \
  const payload = {
    id: user.id,
    username: user.username
  };

  // Sign token
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  res.json({ message: 'Login successful', token });
});

export default router;




