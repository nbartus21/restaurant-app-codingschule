import express from 'express';
import { createCheckoutSession, handleSuccessfulPayment } from '../controllers/checkoutController.js';
import auth from '../middleware/auth.js';
import { deleteOrderBySessionId } from '../controllers/orderController.js';

const router = express.Router();

router.post('/create-checkout-session', auth, createCheckoutSession);
router.get('/success', handleSuccessfulPayment);
router.delete('/cancel/order', deleteOrderBySessionId);
export default router;