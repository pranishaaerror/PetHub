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

app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  // Check if the email exists in your user database
  if (users[email]) {
    // Generate a reset token
    const token = crypto.randomBytes(20).toString('hex');
    // Store the token with the user's email in a database or in-memory store
    users[email].resetToken = token;
    // Send the reset token to the user's email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: http://localhost:3000/reset-password/${token}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error sending email');
      } else {
        console.log(`Email sent: ${info.response}`);
        res.status(200).send('Check your email for instructions on resetting your password');
      }
    });
  } else {
    res.status(404).send('Email not found');
  }
});

export default router;




