import express from 'express';
import AdminSubscription from '../models/AdminSubscription.js';
import auth from '../middleware/auth.js';
import webpush from 'web-push';

const router = express.Router();

router.post('/subscribe', auth, async (req, res) => {
  try {
    const { subscription, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const updatedSubscription = await AdminSubscription.findOneAndUpdate(
      { userId },
      { subscription },
      { upsert: true, new: true }
    );

    console.log('Subscription saved:', updatedSubscription);

    res.status(201).json({ message: 'Subscription added successfully.', subscription: updatedSubscription });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ message: 'Failed to save subscription.' });
  }
});

router.get('/test-notification', async (req, res) => {
    try {
      const adminSubscriptions = await AdminSubscription.find();
      console.log('Found subscriptions:', adminSubscriptions);

      const payload = JSON.stringify({
        title: 'Test Notification',
        body: 'This is a test notification'
      });

      for (const sub of adminSubscriptions) {
        try {
          console.log('Sending notification to:', sub.userId);
          const result = await webpush.sendNotification(sub.subscription, payload);
          console.log('Notification sent successfully:', result);
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }

      res.status(200).json({ message: 'Test notification sent' });
    } catch (error) {
      console.error('Error in test-notification route:', error);
      res.status(500).json({ message: 'Error sending test notification' });
    }
  });

export default router;