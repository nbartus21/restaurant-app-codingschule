import express from 'express';
import {
  createMenuItem,
  getAllMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', createMenuItem);
router.get('/getAll', getAllMenuItems);
router.use(adminAuth);
router.get('/get/:id', getMenuItem);
router.put('/update/:id', updateMenuItem);
router.delete('/delete/:id', deleteMenuItem);

export default router;