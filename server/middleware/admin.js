import User from '../models/User.js';

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error });
  }
};

export default admin;