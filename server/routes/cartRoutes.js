import express from 'express';
import { addToCart, removeFromCart, getCart } from '../controllers/cartController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.post('/add', addToCart);
router.delete('/remove/:menuItemId', removeFromCart);
router.get('/', getCart);

export default router;