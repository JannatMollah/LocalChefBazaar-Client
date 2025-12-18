import axiosSecure from "./axiosSecure";

// Create Stripe payment intent
export const createPaymentIntent = async (paymentData) => {
  try {
    console.log("Creating payment intent with data:", paymentData);
    
    const res = await axiosSecure.post("/payments/create-intent", paymentData);
    
    console.log("Payment intent response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error creating payment intent:", error.response?.data || error.message);
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

// Get payment history
export const getPaymentHistory = async () => {
  try {
    const res = await axiosSecure.get("/payments/history");
    return res.data;
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return [];
  }
};