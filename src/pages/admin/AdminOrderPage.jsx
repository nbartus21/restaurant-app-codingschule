import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useOutletContext } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [orderToComplete, setOrderToComplete] = useState(null);
  const { token } = useOutletContext();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/order/all", {
        headers: {
          "x-auth-token": token,
        },
      });
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/order/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ status: "completed" }),
        }
      );
      const updatedOrder = await response.json();
      setOrders(
        orders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      setIsCompleteModalOpen(false);
      toast({
        title: "Status updated",
        description: `Order status has been updated to completed.`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/order/${id}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
        },
      });
      setOrders(orders.filter((order) => order._id !== id));
      setIsDeleteModalOpen(false);
      toast({
        title: "Order deleted",
        description: "Order has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Manage Orders</h1>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <label htmlFor="statusFilter" className="mr-2 text-gray-700">
            Filter by status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md p-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <motion.div
            key={order._id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Order #{order._id.slice(-6)}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium ${
                  order.status === "pending"
                    ? "bg-yellow-200 text-yellow-800"
                    : order.status === "paid"
                    ? "bg-green-200 text-green-800"
                    : order.status === "cancelled"
                    ? "bg-red-200 text-red-800"
                    : "bg-blue-200 text-blue-800"
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-gray-600 mb-2">
              Total: ${order.totalPrice.toFixed(2)}
            </p>
            <p className="text-gray-600 mb-4">
              Date: {format(new Date(order.createdAt), "PPP")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedOrder(order)}
                size="sm"
                className="flex-1"
              >
                View Details
              </Button>
              {order.status !== "completed" && order.status !== "cancelled" && (
                <Button
                  onClick={() => {
                    setOrderToComplete(order);
                    setIsCompleteModalOpen(true);
                  }}
                  size="sm"
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark Completed
                </Button>
              )}
              <Button
                onClick={() => {
                  setOrderToDelete(order);
                  setIsDeleteModalOpen(true);
                }}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Details Modal */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <h2 className="text-2xl font-bold mb-4">Order Details</h2>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p>
                  <strong>Order ID:</strong> {selectedOrder._id}
                </p>
                <p>
                  <strong>Status:</strong> {selectedOrder.status}
                </p>
                <p>
                  <strong>Total Price:</strong> $
                  {selectedOrder.totalPrice.toFixed(2)}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {format(new Date(selectedOrder.createdAt), "PPP")}
                </p>
                {selectedOrder.completedAt && (
                  <p>
                    <strong>Completed At:</strong>{" "}
                    {format(new Date(selectedOrder.completedAt), "PPP")}
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold mt-4 mb-2">Items:</h3>
                <ul className="divide-y">
                  {selectedOrder.items.map((item, index) => (
                    <li key={index} className="py-2">
                      <p>
                        <strong>{item.menuItem.title}</strong> x {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: ${item.menuItem.price.toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mt-4 mb-2">
                  User Information:
                </h3>
                <p>
                  <strong>Name:</strong> {selectedOrder.user.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.user.email}
                </p>
              </div>
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
          <p>
            Are you sure you want to delete Order #
            {orderToDelete?._id.slice(-6)}?
          </p>
          <p className="text-sm text-gray-600 mt-2">
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDelete(orderToDelete?._id)}
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
{/* Completion Confirmation Modal */}
<Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
  <DialogContent>
    <DialogClose className="absolute right-4 top-4">
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </DialogClose>
    <h2 className="text-2xl font-bold mb-4">Confirm Completion</h2>
    <p>Are you sure you want to mark Order #{orderToComplete?._id.slice(-6)} as completed?</p>
    <p className="text-sm text-gray-600 mt-2">This action will update the order status to &quot;completed&quot;.</p>
    <div className="flex justify-end space-x-2 mt-4">
      <Button onClick={() => setIsCompleteModalOpen(false)} variant="outline">Cancel</Button>
      <Button onClick={() => handleStatusChange(orderToComplete?._id)} variant="default">Mark as Completed</Button>
    </div>
  </DialogContent>
</Dialog>



    </div>
  );
};

export default AdminOrderPage;
