import express from 'express';
import { completeReservation, createReservation, deleteReservation, getAllReservations, getBookedTables, getUserReservations, updateReservation} from '../controllers/reservationController.js';
import auth from '../middleware/auth.js';
import { createReservationCheckoutSession, handleSuccessfulReservationPayment } from '../controllers/checkoutController.js';
import admin from '../middleware/admin.js';

const router = express.Router();

router.post('/create', auth, createReservation);
router.get('/booked', getBookedTables);
router.post('/create-checkout-session', auth, createReservationCheckoutSession);
router.get('/success', handleSuccessfulReservationPayment);
router.get('/user', auth, getUserReservations);
router.delete('/delete/:id', auth, deleteReservation);
router.put('/:id', auth, updateReservation);
router.get('/all',auth, admin, getAllReservations);
router.put('/complete/:id',auth, admin, completeReservation);

export default router;