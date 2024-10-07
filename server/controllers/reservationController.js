import Reservation from "../models/Reservation.js";
import webpush from "web-push";
import AdminSubscription from "../models/AdminSubscription.js";
import process from "process";
import dotenv from "dotenv";

dotenv.config();

webpush.setVapidDetails(
  "mailto:test@test.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const createReservation = async (req, res) => {
  try {
    let reservationData;
    if (typeof req.body === "string") {
      reservationData = JSON.parse(req.body);
    } else if (req.body.body) {
      reservationData = JSON.parse(req.body.body);
    } else {
      reservationData = req.body;
    }

    const { tableNumber, date, bookingTime, guestCount, stripeSessionId } =
      reservationData;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const reservationDate = new Date(date).toDateString();

    const currentDate = new Date();
    const reserveDate = new Date(date);
    const [hours, minutes] = bookingTime.split(":").map(Number);
    reserveDate.setHours(hours, minutes, 0, 0);

    if (reserveDate <= currentDate) {
      return res
        .status(400)
        .json({ message: "Reservation date and time must be in the future" });
    }

    const timeDifference = reserveDate.getTime() - currentDate.getTime();
    if (timeDifference < 15 * 60 * 1000) {
      // 15 minutes in milliseconds
      return res.status(400).json({
        message: "Reservation must be at least 15 minutes in the future",
      });
    }

    // Check if the table is available
    const existingReservation = await Reservation.findOne({
      tableNumber,
      date: reservationDate,
      bookingTime,
      status: "active",
      stripeSessionId: { $exists: true },
    });

    if (existingReservation) {
      return res.status(400).json({
        message: "This table is already reserved for the selected time",
      });
    }

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const reservation = new Reservation({
      user: req.user,
      tableNumber,
      date: reservationDate,
      bookingTime,
      guestCount,
      stripeSessionId: stripeSessionId,
    });

    await reservation.save();
    const payload = JSON.stringify({
      title: "New Reservation",
      body: `A new reservation has been made for table ${reservation.tableNumber}`,
    });

    const adminSubscriptions = await AdminSubscription.find();
    adminSubscriptions.forEach((subscription) => {
      webpush
        .sendNotification(subscription.subscription, payload)
        .catch((error) => {
          console.error(
            "Error sending notification, we will delete subscription:",
            error
          );
          AdminSubscription.findByIdAndDelete(subscription._id).catch(
            console.error
          );
        });
    });
    res.status(201).json(reservation);
  } catch (error) {
    console.error("Error in createReservation:", error);
    res.status(400).json({ message: error.message, stack: error.stack });
  }
};

export const getBookedTables = async (req, res) => {
  try {
    const { date, time } = req.query;
    const reservationDate = new Date(date).toDateString();
    const reservations = await Reservation.find({
      date: reservationDate,
      bookingTime: time,
      status: "active",
    });
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error in getBookedTables:", error);
    res.status(400).json({ message: error.message, stack: error.stack });
  }
};

export const getUserReservations = async (req, res) => {
  try {
    const userId = req.user;
    const reservations = await Reservation.find({ user: userId }).sort({
      date: 1,
      bookingTime: 1,
    });
    res.json(reservations);
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    res.status(500).json({ message: "Error fetching user reservations" });
  }
};

export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "name email")
      .sort({ date: 1, bookingTime: 1 });
    res.json(reservations);
  } catch (error) {
    console.error("Error fetching all reservations:", error);
    res.status(500).json({ message: "Error fetching all reservations" });
  }
};
export const completeReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      {
        status: "completed",
        completedAt: new Date(),
      },
      { new: true }
    );
    if (!updatedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json(updatedReservation);
  } catch (error) {
    console.error("Error completing reservation:", error);
    res.status(500).json({ message: "Error completing reservation" });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReservation = await Reservation.findByIdAndDelete(id);
    if (!deletedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    const payload = JSON.stringify({
      title: "Reservation Cancelled",
      body: `Reservation ${deletedReservation._id} has been cancelled`,
    });
    const adminSubscriptions = await AdminSubscription.find();
    adminSubscriptions.forEach((subscription) => {
      webpush
        .sendNotification(subscription.subscription, payload)
        .catch((error) => {
          console.error(
            "Error sending notification, we will delete subscription:",
            error
          );
          AdminSubscription.findByIdAndDelete(subscription._id).catch(
            console.error
          );
        });
    });
    res.json({ message: "Reservation deleted successfully" });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({ message: "Error deleting reservation" });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, bookingTime, tableNumber, guestCount } = req.body;

    // Check if the new table and time slot are available
    const existingReservation = await Reservation.findOne({
      tableNumber,
      date: new Date(date).toDateString(),
      bookingTime,
      status: "active",
      _id: { $ne: id },
    });

    if (existingReservation) {
      return res
        .status(400)
        .json({
          message: "This table is already reserved for the selected time",
        });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      {
        date: new Date(date).toDateString(),
        bookingTime,
        tableNumber,
        guestCount,
      },
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    const payload = JSON.stringify({
      title: "Reservation Updated",
      body: `Reservation ${updatedReservation._id} has been updated`,
    });
    const adminSubscriptions = await AdminSubscription.find();
    adminSubscriptions.forEach((subscription) => {
      webpush
        .sendNotification(subscription.subscription, payload)
        .catch((error) => {
          console.error(
            "Error sending notification, we will delete subscription:",
            error
          );
          AdminSubscription.findByIdAndDelete(subscription._id).catch(
            console.error
          );
        });
    });
    res.json(updatedReservation);
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({ message: "Error updating reservation" });
  }
};
