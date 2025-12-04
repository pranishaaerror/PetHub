import jwt from 'jsonwebtoken';
import express from 'express';
import User from "../models/User.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"
import crypto from 'node:crypto'
import UserPasswordResetToken from '../models/UserPasswordResetToken.js';

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

function generateRandomHexString(length) {
    // Each byte converts to 2 hex characters, so request half the desired length in bytes
    const bytesLength = Math.ceil(length / 2); 
    const randomBytes = crypto.randomBytes(bytesLength);
    return randomBytes.toString('hex').slice(0, length); // Slice to ensure exact length if odd number requested
}

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  // Check if the email exists in your user database
  const user = await User.findOne({email});
  if (user) {
    // Generate a reset token
    const token =generateRandomHexString(10);
    // Store the token with the user's email in a database or in-memory store
    
    const userToken = new UserPasswordResetToken({
      
      email,
     token,
    });
     await userToken.save();


    
    // Send the reset token to the user's email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'np03cs4s240022@heraldcollege.edu.np',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    const mailOptions = {
      from: 'np03cs4s240022@heraldcollege.edu.np',
      to: email,
      subject: 'Password Reset',
      text: `Password Reset Token: ${token}`,
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

router.post("/reset-password",async (req,res) => {
  const {password,token} = req.body;
  const userToken= await UserPasswordResetToken.findOne({token});
  if (userToken) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ email: userToken.email }, {password:hashedPassword},);
    await UserPasswordResetToken.deleteOne({email:userToken.email});
    res.status(200).send('Password updated successfully');
  } else {
    res.status(404).send('Invalid or expired token');
  }
})
export default router;




