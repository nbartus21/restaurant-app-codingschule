import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const reservationSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tableNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 15
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  date: {
    type: String,
    required: true
  },
  bookingTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  stripeSessionId: {
    type: String,
    required: true,
    unique: true
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);