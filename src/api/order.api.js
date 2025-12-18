import axiosSecure from "./axiosSecure";

// Place single order
export const placeOrder = async (orderData) => {
  try {
    const res = await axiosSecure.post("/orders", orderData);
    return res.data;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

// Place bulk order (multiple items)
export const placeBulkOrder = async (orderData) => {
  try {
    const res = await axiosSecure.post("/orders/bulk", orderData);
    return res.data;
  } catch (error) {
    console.error("Error placing bulk order:", error);
    throw error;
  }
};

// Get user orders
export const getUserOrders = async () => {
  try {
    const res = await axiosSecure.get("/orders/my");
    return res.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const res = await axiosSecure.get(`/orders/${orderId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};