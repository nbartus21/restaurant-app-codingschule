import User from '../models/User.js';

export const addToCart = async (req, res) => {
    try {
      const { menuItemId, quantity } = req.body;
      const userId = req.user;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      for (let i = 0; i < quantity; i++) {
        user.cart.push(menuItemId);
      }
      await user.save();

      res.status(200).json({ message: 'Item added to cart', cart: user.cart });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const removeFromCart = async (req, res) => {
    try {
      const { menuItemId } = req.params;
      const { quantity } = req.body;
      const userId = req.user;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const itemIndex = user.cart.findIndex(item => item.toString() === menuItemId);
      if (itemIndex !== -1) {
        user.cart.splice(itemIndex, quantity);
      }
      await user.save();

      res.status(200).json({ message: 'Item removed from cart', cart: user.cart });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const getCart = async (req, res) => {
    try {
      const userId = req.user;

      const user = await User.findById(userId).populate('cart');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ cart: user.cart });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };