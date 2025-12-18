import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { confirmPayment } from "../api/order.api";
import { createPaymentIntent } from "../api/payment.api";
import Swal from "sweetalert2";

const Payment = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  // Load order data from checkout page state
  useEffect(() => {
    const initializePayment = async () => {
      if (!user) return;

      try {
        setInitLoading(true);
        
        // 1. Get order data from location state (Checkout থেকে এসেছে)
        const orderData = location.state?.orderData;
        
        if (!orderData) {
          setError("No order data found. Please checkout again.");
          setInitLoading(false);
          
          Swal.fire({
            title: "Session Expired",
            text: "Please go back to checkout and try again.",
            icon: "warning",
          }).then(() => {
            navigate("/checkout");
          });
          return;
        }

        console.log("Order data from checkout:", orderData);
        
        // Validate required data
        if (!orderData.totalAmount || orderData.totalAmount <= 0) {
          setError("Invalid order amount");
          setInitLoading(false);
          return;
        }

        // 2. Create payment intent with correct amount from checkout
        console.log("Creating payment intent with amount:", orderData.totalAmount);
        
        const paymentIntentData = await createPaymentIntent({
          amount: orderData.totalAmount,
          orderId: orderData.orderId,
          description: `Payment for ${orderData.itemCount || 1} item(s) from Local Chef Bazaar`,
          orderData: orderData
        });

        if (!paymentIntentData.clientSecret) {
          throw new Error("No client secret received from server");
        }

        setClientSecret(paymentIntentData.clientSecret);
        
      } catch (error) {
        console.error("Payment initialization error:", error);
        setError(`Failed to initialize payment: ${error.message}`);
        
        Swal.fire({
          title: "Payment Error",
          text: "Failed to initialize payment. Please try again.",
          icon: "error",
        }).then(() => {
          navigate("/checkout");
        });
      } finally {
        setInitLoading(false);
      }
    };

    initializePayment();
  }, [user, location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError("Stripe not initialized");
      return;
    }

    if (!clientSecret) {
      setError("Payment session not ready");
      return;
    }

    const orderData = location.state?.orderData;
    if (!orderData) {
      setError("Order data missing");
      return;
    }

    setLoading(true);
    setError("");

    const cardElement = elements.getElement(CardElement);

    try {
      // 1. Create payment method
      const { error: paymentMethodError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message);
        setLoading(false);
        return;
      }

      // 2. Confirm card payment
      const { error: stripeError, paymentIntent } = 
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      // 3. Payment successful - Save to database
      if (paymentIntent.status === "succeeded") {
        await confirmPayment({
          orderId: orderData.orderId,
          transactionId: paymentIntent.id,
          amount: orderData.totalAmount, // Use the amount from orderData
          orderData: orderData
        });

        setSuccess(true);
        
        // Show success message
        Swal.fire({
          title: "Payment Successful! 🎉",
          html: `
            <div class="text-center">
              <p class="text-lg font-semibold text-gray-800 mb-2">
                ৳${orderData.totalAmount} Paid Successfully
              </p>
              <p class="text-gray-600 mb-3">
                Your order for ${orderData.itemCount || 1} item(s) is now being prepared.
              </p>
              <div class="text-left text-sm bg-gray-50 p-3 rounded-lg mt-3">
                <p><strong>Delivery Address:</strong></p>
                <p class="text-gray-700">${orderData.address || "Not specified"}</p>
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "View Orders",
          confirmButtonColor: "#DF603A",
          showCancelButton: true,
          cancelButtonText: "Back to Home",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/dashboard/orders");
          } else {
            navigate("/");
          }
        });
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setError("An error occurred during payment processing.");
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#2D1B12',
        fontFamily: 'Inter, sans-serif',
        '::placeholder': {
          color: '#a0aec0',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
  };

  if (!user) {
    navigate("/auth", { state: { from: "/payment" } });
    return null;
  }

  if (initLoading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-[#DF603A] mb-4" />
        <p className="text-gray-600">Initializing payment session...</p>
      </div>
    );
  }

  if (success) {
    const orderData = location.state?.orderData;
    return (
      <div className="min-h-screen bg-[#FBFAF8] pt-32 pb-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="playfair-font text-3xl font-bold text-[#2D1B12] mb-4">
              Payment Successful!
            </h1>
            <div className="bg-green-50 p-4 rounded-xl mb-6">
              <p className="text-lg font-bold text-green-800">
                ৳{orderData?.totalAmount || 0} Paid
              </p>
              <p className="text-sm text-green-700 mt-1">
                Order for {orderData?.itemCount || 1} item(s)
              </p>
            </div>
            <p className="text-gray-600 mb-8">
              Your payment has been processed. Your order is now being prepared.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/dashboard/orders")}
                className="w-full bg-[#DF603A] text-white py-3 rounded-xl font-semibold hover:bg-[#c95232] transition"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const orderData = location.state?.orderData;

  return (
    <div className="min-h-screen bg-[#FBFAF8] pt-24 pb-20">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#DF603A] to-orange-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="playfair-font text-2xl font-bold text-white">
                  Complete Payment
                </h1>
                <p className="text-white/90 text-sm mt-1">
                  {orderData?.itemCount || 1} Item(s)
                </p>
              </div>
              <Shield className="w-10 h-10 text-white/80" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Order Summary */}
            {orderData && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">Order Summary</h3>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Items</span>
                    <span className="font-medium">
                      {orderData.itemCount || 1}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ৳{orderData.subtotal || orderData.totalAmount}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">
                      ৳{orderData.deliveryFee || 0}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-lg font-bold mt-2">
                      <span>Total Amount</span>
                      <div className="text-right">
                        <span className="text-[#DF603A] text-2xl">
                          ৳{orderData.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Card Details
                </label>
                <div className="border rounded-xl p-4 bg-white">
                  <CardElement options={cardElementOptions} />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Test Card: 4242 4242 4242 4242 | Exp: 12/34 | CVC: 123
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Security Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Secure Payment</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your payment of <span className="font-bold">৳{orderData?.totalAmount || 0}</span> is encrypted and secure.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={!stripe || !clientSecret || loading}
                  className="w-full bg-gradient-to-r from-[#DF603A] to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      Pay ৳{orderData?.totalAmount || 0}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="w-full border border-gray-300 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  Back to Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;