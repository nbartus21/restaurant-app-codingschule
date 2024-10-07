import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = async (menuItem, quantity = 1) => {
    try {
      const response = await fetch('http://localhost:8080/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
        body: JSON.stringify({ menuItemId: menuItem._id, quantity }),
      });
      await response.json();
      await fetchCart();
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const removeFromCart = async (menuItemId, quantity = 1) => {
    try {
      const response = await fetch(`http://localhost:8080/api/cart/remove/${menuItemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
        body: JSON.stringify({ quantity }),
      });
      await response.json();
      await fetchCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/cart', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      const data = await response.json();
      // Group items by their ID and calculate quantities
      const groupedCart = data.cart.reduce((acc, item) => {
        if (!acc[item._id]) {
          acc[item._id] = { ...item, quantity: 1 };
        } else {
          acc[item._id].quantity += 1;
        }
        return acc;
      }, {});
      setCart(Object.values(groupedCart));
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);