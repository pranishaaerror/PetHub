import jwt from 'jsonwebtoken';
import express from 'express';
import User from "../models/User.js";

const router = express.Router();

const JWT_SECRET = 'your-jwt-secret-key';

router.post("/signup",async(req,res) => {
    return res.status(200).json({message:"Created"})
})

// Login route - generate token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
      const user = await User.findOne({
            email:{$eq:email},
            password:{$eq:password}
      });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  // Sign token
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  res.json({ message: 'Login successful', token });
});

export default router;




