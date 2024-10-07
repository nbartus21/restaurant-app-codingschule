import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import process from 'process';
import bcrypt from 'bcryptjs';

export const checkAdminStatus = async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.json({ isAdmin: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isAdmin) {
      return res.json({ isAdmin: false });
    }

    res.json({ isAdmin: true });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', error: error.message });
    }
    console.error('Error checking admin status:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const adminUsers = await User.find({ isAdmin: true }).select('-password');
    res.json(adminUsers);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAdminUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin user
    const user = new User({
      name: username,
      email,
      password: hashedPassword,
      isAdmin: true
    });

    await user.save();

    // Create and send JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};