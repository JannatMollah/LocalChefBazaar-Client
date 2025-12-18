import axiosSecure from "./axiosSecure";

// Place single order (Direct Order)
export const placeOrder = async (orderData) => {
  try {
    const res = await axiosSecure.post("/orders", orderData);
    return res.data;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

// Place bulk order (Checkout from Cart)
export const placeBulkOrder = async (orderData) => {
  try {
    const res = await axiosSecure.post("/orders", orderData);
    return res.data;
  } catch (error) {
    console.error("Error placing bulk order:", error);
    throw error;
  }
};

// Create Stripe payment intent
export const createPaymentIntent = async (paymentData) => {
  try {
    const res = await axiosSecure.post("/payments/create-intent", paymentData);
    return res.data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

// Confirm payment success
export const confirmPayment = async (paymentData) => {
  try {
    const res = await axiosSecure.post("/payments/success", paymentData);
    return res.data;
  } catch (error) {
    console.error("Error confirming payment:", error);
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