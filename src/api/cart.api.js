import axiosSecure from "./axiosSecure";

// Get cart items
export const getCartItems = async () => {
  try {
    const res = await axiosSecure.get("/cart");
    return res.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
};

// Add to cart
export const addToCart = async (item) => {
  try {
    const res = await axiosSecure.post("/cart", item);
    return res.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItem = async (itemId, quantity) => {
  try {
    const res = await axiosSecure.patch(`/cart/${itemId}`, { quantity });
    return res.data;
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
};

// Remove from cart
export const removeCartItem = async (itemId) => {
  try {
    const res = await axiosSecure.delete(`/cart/${itemId}`);
    return res.data;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

// Clear cart
export const clearCart = async () => {
  try {
    const res = await axiosSecure.delete("/cart/clear");
    return res.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};