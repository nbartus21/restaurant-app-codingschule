import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const { cart, addToCart, removeFromCart, fetchCart } = useCart();
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    console.log(token);
  }, []);

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

  const handleCheckout = async () => {
    if (isProcessingCheckout) return; // Prevent multiple clicks
    setIsProcessingCheckout(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/checkout/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      if (response.status === 401) {
        // User is not logged in
        navigate("/login");
        toast({
          title: "Authentication Required",
          description: "Please log in to proceed with checkout.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { sessionId } = await response.json();

      if (!sessionId) {
        throw new Error("No session ID received from the server");
      }

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Stripe redirect error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
      toast({
        title: "Checkout Failed",
        description:
          "An error occurred while processing your checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:8080/api/menu/getAll"
        );
        const data = await response.json();
        setAllMenuItems(data);
        setDisplayedItems(data);

        const uniqueCategories = [
          "All",
          ...new Set(data.map((item) => item.category)),
        ];
        setCategories(uniqueCategories);
        await fetchCart();
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  const filterItems = useCallback(() => {
    let filtered = allMenuItems;
    if (activeCategory !== "All") {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [activeCategory, searchQuery, allMenuItems]);

  useEffect(() => {
    const filteredItems = filterItems();
    setDisplayedItems(filteredItems);
  }, [activeCategory, searchQuery, filterItems]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (selectedItem) {
      const itemToAdd = {
        ...selectedItem,
        quantity,
        price: selectedItem.price || 0,
      };
      addToCart(itemToAdd, quantity);
      setSelectedItem(null);
      setQuantity(1);
    }
  };

  const updateCartItemQuantity = (id, newQuantity) => {
    const item = cart.find((item) => item._id === id);
    if (item) {
      if (newQuantity <= 0) {
        removeFromCart(id, item.quantity);
      } else if (newQuantity > item.quantity) {
        addToCart(item, newQuantity - item.quantity);
      } else {
        removeFromCart(id, item.quantity - newQuantity);
      }
    }
  };
  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 1),
      0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-32">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-8"
        >
          Our Menu
        </motion.h1>

        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        <div className="flex justify-center mb-8">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`mx-2 px-4 py-2 rounded-full transition-colors duration-300 ${
                activeCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <AnimatePresence>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="w-full h-48 bg-gray-300 animate-pulse" />
                    <div className="p-4">
                      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-300 rounded w-full mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse" />
                    </div>
                  </motion.div>
                ))
              : displayedItems.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="relative w-full h-48">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/600x400?text=Image+Not+Found";
                        }}
                      />
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-lg font-semibold">
                          View Details
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      <p className="text-lg font-bold text-blue-600">
                        €{item.price.toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
          </AnimatePresence>
        </div>

        <Dialog
          open={!!selectedItem}
          onOpenChange={() => setSelectedItem(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            {selectedItem && (
              <div className="grid gap-4 py-4">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
                <p className="text-gray-600">{selectedItem.description}</p>
                <p className="text-xl font-bold text-blue-600">
                  €{selectedItem.price.toFixed(2)}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      variant="outline"
                      size="icon"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-4 text-lg font-semibold">
                      {quantity}
                    </span>
                    <Button
                      onClick={() => setQuantity(quantity + 1)}
                      variant="outline"
                      size="icon"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isAuthenticated ? "Add to Cart" : "Login to Add to Cart"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between py-2 border-b"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-600">
                          €{(item.price || 0).toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button
                        onClick={() =>
                          updateCartItemQuantity(item._id, item.quantity - 1)
                        }
                        variant="outline"
                        size="icon"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button
                        onClick={() =>
                          updateCartItemQuantity(item._id, item.quantity + 1)
                        }
                        variant="outline"
                        size="icon"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="mt-4">
                  <p className="text-xl font-bold">
                    Total: €{getTotalPrice().toFixed(2)}
                  </p>
                  <Button
                    className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <motion.div
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
