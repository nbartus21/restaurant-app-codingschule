import Order from '../models/Order.js';
import User from '../models/User.js';
import Menu from '../models/Menu.js';
import stripe from 'stripe';
import process from 'process';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { createReservation } from './reservationController.js';
import webpush from 'web-push';
import AdminSubscription from '../models/AdminSubscription.js';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);


const stripeClient = stripe(process.env.SECRET_STRIPE_KEY);

export const createCheckoutSession = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const userId = req.user;
      const user = await User.findById(userId).populate('cart');

      if (!user || user.cart.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Group cart items by menuItem ID and calculate quantities
      const groupedCart = user.cart.reduce((acc, item) => {
        const itemId = item._id.toString();
        if (!acc[itemId]) {
          acc[itemId] = { item, quantity: 1 };
        } else {
          acc[itemId].quantity += 1;
        }
        return acc;
      }, {});

      const lineItems = await Promise.all(Object.values(groupedCart).map(async ({ item, quantity }) => {
        const menuItem = await Menu.findById(item._id);
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: menuItem.title,
            },
            unit_amount: Math.round(menuItem.price * 100), // Stripe expects amounts in cents
          },
          quantity: quantity,
        };
      }));

      const stripeSession = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
        client_reference_id: userId.toString(),
      });

      // Create order items with correct menuItem references
      const orderItems = Object.values(groupedCart).map(({ item, quantity }) => ({
        menuItem: item._id,
        quantity: quantity,
      }));

      // Create a pending order
      const pendingOrder = new Order({
        user: userId,
        items: orderItems,
        totalPrice: stripeSession.amount_total / 100,
        status: 'pending',
        stripeSessionId: stripeSession.id,
      });

      await pendingOrder.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.json({ sessionId: stripeSession.id });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error creating checkout session:', error);
      res.status(500).json({ message: 'Error creating checkout session' });
    }
  };

  export const handleSuccessfulPayment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { session_id } = req.query;
      console.log(`Processing payment for session ID: ${session_id}`);

      if (!session_id) {
        throw new Error('No session ID provided');
      }

      const stripeSession = await stripeClient.checkout.sessions.retrieve(session_id);
      console.log(`Stripe session status: ${stripeSession.payment_status}`);

      if (stripeSession.payment_status !== 'paid') {
        throw new Error('Payment not successful');
      }

      const userId = stripeSession.client_reference_id;
      console.log(`User ID from stripe session: ${userId}`);

      if (!userId) {
        throw new Error('No user ID found in Stripe session');
      }

      // Find the order, regardless of its status
      const order = await Order.findOne({ stripeSessionId: session_id }).session(session);

      if (!order) {
        throw new Error(`No order found for session ID: ${session_id}`);
      }

      if (order.status === 'pending') {
        // Update the order status to 'paid'
        order.status = 'paid';
        await order.save({ session });

        await session.commitTransaction();
        const payload = JSON.stringify({
          title: 'New Order',
          body: `A new order has been placed with ID ${order._id}`
        });

        const adminSubscriptions = await AdminSubscription.find();
        adminSubscriptions.forEach(subscription => {
          webpush.sendNotification(subscription.subscription, payload).catch(error => {
            console.error('Error sending notification, we will delete subscription:', error);
            AdminSubscription.findByIdAndDelete(subscription._id).catch(console.error);
          });
        });
        console.log(`Order successfully updated: ${order._id}`);
      } else {
        await session.abortTransaction();
        console.log(`Order already processed: ${order._id}`);
      }

      // Always return a success response to the frontend
      res.status(200).json({ message: 'Payment successful', orderId: order._id });
    } catch (error) {
      await session.abortTransaction();
      console.error('Error handling successful payment:', error);
      res.status(500).json({ message: error.message || 'Error handling successful payment' });
    } finally {
      session.endSession();
    }
  };

  // Add these new functions after the existing ones

export const createReservationCheckoutSession = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user;
    const { tableNumber, date, bookingTime, guestCount } = req.body;

    // Create a line item for the reservation
    const lineItems = [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Table Reservation - Table ${tableNumber}`,
          description: `Date: ${date}, Time: ${bookingTime}, Guests: ${guestCount}`,
        },
        unit_amount: 2000,
      },
      quantity: 1,
    }];

    const stripeSession = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/reservation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/reservation`,
      client_reference_id: userId.toString(),
      metadata: {
        tableNumber,
        date,
        bookingTime,
        guestCount,
      },
    });

    await session.commitTransaction();
    session.endSession();

    res.json({ sessionId: stripeSession.id });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating reservation checkout session:', error);
    res.status(500).json({ message: 'Error creating reservation checkout session' });
  }
};


export const handleSuccessfulReservationPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { session_id } = req.query;
    if (!session_id) {
      throw new Error('No session ID provided');
    }

    const stripeSession = await stripeClient.checkout.sessions.retrieve(session_id);
    if (stripeSession.payment_status !== 'paid') {
      throw new Error('Payment not successful');
    }

    const userId = stripeSession.client_reference_id;
    const { tableNumber, date, bookingTime, guestCount } = stripeSession.metadata;

    const mockReq = {
      user: userId,
      body: {
        tableNumber,
        date,
        bookingTime,
        guestCount,
        stripeSessionId: stripeSession.id
      }
    };

    let reservationId;

    const mockRes = {
      status: (statusCode) => ({
        json: (data) => {
          if (statusCode === 201) {
            reservationId = data._id;
          } else {
            throw new Error(data.message);
          }
        }
      })
    };

    // Call the createReservation function
    await createReservation(mockReq, mockRes);

    await session.commitTransaction();
    res.status(200).json({ message: 'Reservation successful', reservationId });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error handling successful reservation payment:', error);
    res.status(500).json({ message: error.message || 'Error handling successful reservation payment' });
  } finally {
    session.endSession();
  }
};

