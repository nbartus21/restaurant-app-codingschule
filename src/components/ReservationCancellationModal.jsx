
const ReservationCancellationModal = ({ reservation, onCancel, onClose }) => {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <h3 className="text-lg font-bold">Cancel Reservation</h3>
          <p className="mt-2">Are you sure you want to cancel this reservation?</p>
          <p className="mt-2">Table: {reservation.tableNumber}</p>
          <p>Date: {new Date(reservation.date).toLocaleDateString()}</p>
          <p>Time: {reservation.bookingTime}</p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded mr-2"
            >
              Close
            </button>
            <button
              onClick={() => onCancel(reservation._id)}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ReservationCancellationModal;