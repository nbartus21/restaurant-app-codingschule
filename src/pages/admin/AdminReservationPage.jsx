import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Eye, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import api from "@/utils/api";

const AdminReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewReservation, setViewReservation] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [reservationToComplete, setReservationToComplete] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations/all');
      setReservations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reservations/delete/${id}`);
      setReservations(reservations.filter(reservation => reservation._id !== id));
      setIsDeleteModalOpen(false);
      toast({
        title: "Reservation deleted",
        description: "Reservation has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast({
        title: "Error",
        description: "Failed to delete reservation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      const response = await api.put(`/reservations/complete/${id}`);
      const updatedReservation = response.data;
      setReservations(reservations.map(reservation =>
        reservation._id === updatedReservation._id ? updatedReservation : reservation
      ));
      setIsCompleteModalOpen(false);
      toast({
        title: "Reservation completed",
        description: `Reservation for table ${updatedReservation.tableNumber} has been marked as completed.`,
      });
    } catch (error) {
      console.error('Error marking reservation as completed:', error);
      toast({
        title: "Error",
        description: "Failed to mark reservation as completed. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-10">
      <h1 className="text-3xl font-bold mb-8">Manage Reservations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservations.map((reservation) => (
          <motion.div
            key={reservation._id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-lg shadow-md p-4"
          >
            <h3 className="text-xl font-semibold mb-2">Table {reservation.tableNumber}</h3>
            <p className="text-gray-600 mb-2">Date: {format(new Date(reservation.date), 'MMMM d, yyyy')}</p>
            <p className="text-gray-600 mb-2">Time: {reservation.bookingTime}</p>
            <p className="text-gray-600 mb-2">Guests: {reservation.guestCount}</p>
            <p className="text-lg font-bold text-blue-600 mb-4">Status: {reservation.status}</p>
            <div className="flex flex-col justify-center gap-2">
                <div>
              <Button className="w-full flex justify-center items-center" onClick={() => setViewReservation(reservation)} size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
                </div>
              {reservation.status !== 'completed' && (
                <Button onClick={() => { setReservationToComplete(reservation); setIsCompleteModalOpen(true); }} size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Completed
                </Button>
              )}
              <Button onClick={() => { setReservationToDelete(reservation); setIsDeleteModalOpen(true); }} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View Reservation Details Modal */}
      <Dialog open={!!viewReservation} onOpenChange={() => setViewReservation(null)}>
        <DialogContent>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <h2 className="text-2xl font-bold mb-4">Reservation Details</h2>
          {viewReservation && (
            <div className="space-y-2">
              <p><strong>Table Number:</strong> {viewReservation.tableNumber}</p>
              <p><strong>Date:</strong> {format(new Date(viewReservation.date), 'MMMM d, yyyy')}</p>
              <p><strong>Time:</strong> {viewReservation.bookingTime}</p>
              <p><strong>Guests:</strong> {viewReservation.guestCount}</p>
              <p><strong>Status:</strong> {viewReservation.status}</p>
              <p><strong>User:</strong> {viewReservation.user.name}</p>
              <p><strong>Email:</strong> {viewReservation.user.email}</p>
              {viewReservation.status === 'completed' && (
                <p><strong>Completed At:</strong> {format(new Date(viewReservation.completedAt), 'MMMM d, yyyy HH:mm')}</p>
              )}
              <p><strong>Created At:</strong> {format(new Date(viewReservation.createdAt), 'MMMM d, yyyy HH:mm')}</p>
              <p><strong>Updated At:</strong> {format(new Date(viewReservation.updatedAt), 'MMMM d, yyyy HH:mm')}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
          <p>Are you sure you want to delete the reservation for Table {reservationToDelete?.tableNumber}?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={() => handleDelete(reservationToDelete?._id)} variant="destructive">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Confirmation Modal */}
      <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
        <DialogContent>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <h2 className="text-2xl font-bold mb-4">Confirm Completion</h2>
          <p>Are you sure you want to mark the reservation for Table {reservationToComplete?.tableNumber} as completed?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => setIsCompleteModalOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={() => handleMarkCompleted(reservationToComplete?._id)} variant="default">Complete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReservationPage;