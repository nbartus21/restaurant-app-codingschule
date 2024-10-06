import { useEffect, useState } from "react";
import { useOutletContext, Navigate } from "react-router-dom";
import { format, isPast } from 'date-fns';
import api from "../utils/api";
import OrderCancellationModal from "../components/OrderCancellationModal";
import ReservationCancellationModal from "../components/ReservationCancellationModal";
import ReservationModificationModal from "../components/ReservationModificationModal";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const { isAuthenticated, token } = useOutletContext();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedReservationForCancellation, setSelectedReservationForCancellation] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("user");
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await api.get("/order/user");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    const fetchReservations = async () => {
      try {
        const response = await api.get("/reservations/user");
        setReservations(response.data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    if (isAuthenticated && token) {
      fetchUserData();
      fetchOrders();
      fetchReservations();
    }
  }, [isAuthenticated, token]);

  const handleOrderCancel = async (orderId) => {
    try {
      await api.patch(`/order/${orderId}/cancel`);
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: 'cancelled' } : order
      ));
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const handleReservationModify = async (reservationId, updatedData) => {
    try {
      const response = await api.put(`/reservations/${reservationId}`, updatedData);
      setReservations(reservations.map(reservation =>
        reservation._id === reservationId ? response.data : reservation
      ));
      setSelectedReservation(null);
    } catch (error) {
      console.error("Error modifying reservation:", error);
    }
  };

  const handleReservationCancelConfirmation = (reservation) => {
    setSelectedReservationForCancellation(reservation);
  };

  const handleReservationCancelConfirmed = async (reservationId) => {
    try {
      await api.delete(`/reservations/delete/${reservationId}`);
      setReservations(reservations.filter(reservation => reservation._id !== reservationId));
      setSelectedReservationForCancellation(null);
    } catch (error) {
      console.error("Error cancelling reservation:", error);
    }
  };

  const canModifyReservation = (reservation) => {
    const reservationDate = new Date(reservation.date);
    reservationDate.setHours(parseInt(reservation.bookingTime.split(':')[0], 10));
    reservationDate.setMinutes(parseInt(reservation.bookingTime.split(':')[1], 10));
    return reservation.status === 'active' && !isPast(reservationDate);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
          User Profile
        </h2>

        {userData && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                User Information
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userData.name}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userData.email}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        <h3 className="text-2xl font-bold text-gray-900 mb-4">Reservations</h3>
        {reservations.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <ul className="divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <li key={reservation._id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Table {reservation.tableNumber}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reservation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {reservation.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Date: {format(new Date(reservation.date), 'PPP')}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        Time: {reservation.bookingTime}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>Guests: {reservation.guestCount}</p>
                    </div>
                  </div>
                  {canModifyReservation(reservation) && (
                    <div className="mt-2">
                      <button
                        onClick={() => setSelectedReservation(reservation)}
                        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Modify Reservation
                      </button>
                      <button
                        onClick={() => handleReservationCancelConfirmation(reservation)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No reservations found.</p>
        )}

        <h3 className="text-2xl font-bold text-gray-900 mb-4">Orders</h3>
        {orders.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order._id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Order #{order._id}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'completed'
                          ? "bg-green-100 text-green-800"
                          : order.status === 'cancelled'
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Total: ${order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-col items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Ordered on{" "}
                        {format(new Date(order.createdAt), 'PPP')}
                      </p>
                      {order.status === "completed" && (
                        <p>
                          Completed on{" "}
                          {format(new Date(order.completedAt), 'PPP')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      Items:
                    </h4>
                    <ul className="mt-2 divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <li key={item._id} className="py-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-900">
                              {item.menuItem.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {order.status === 'paid' && (
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Cancel Order
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No orders found.</p>
        )}

        {selectedOrder && (
          <OrderCancellationModal
            order={selectedOrder}
            onCancel={handleOrderCancel}
            onClose={() => setSelectedOrder(null)}
          />
        )}

        {selectedReservationForCancellation && (
          <ReservationCancellationModal
            reservation={selectedReservationForCancellation}
            onCancel={handleReservationCancelConfirmed}
            onClose={() => setSelectedReservationForCancellation(null)}
          />
        )}

        {selectedReservation && (
          <ReservationModificationModal
            reservation={selectedReservation}
            onModify={handleReservationModify}
            onClose={() => setSelectedReservation(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;