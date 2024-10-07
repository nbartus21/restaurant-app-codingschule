import express from 'express';
import { getUserOrders, getOrderById, getAllOrders, updateOrderStatus, deleteOrder, cancelOrder } from '../controllers/orderController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

router.get('/all', auth, admin, getAllOrders);
router.get('/user', auth, getUserOrders);
router.get('/:id', auth, getOrderById);
router.patch('/:id/cancel', auth, cancelOrder);
router.patch('/:id/status', auth, admin, updateOrderStatus);
router.delete('/:id', auth, deleteOrder);

export default router;