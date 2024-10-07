import mongoose from 'mongoose';

const adminSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: Object,
    required: true
  }
});

const AdminSubscription = mongoose.model('AdminSubscription', adminSubscriptionSchema);

export default AdminSubscription;