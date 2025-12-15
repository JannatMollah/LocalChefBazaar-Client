import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { savePayment } from "../api/payment.api";
import useAuth from "../hooks/useAuth";

const CheckoutForm = ({ meal }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const card = elements.getElement(CardElement);

    const { paymentMethod, error: methodError } =
      await stripe.createPaymentMethod({
        type: "card",
        card,
      });

    if (methodError) {
      setError(methodError.message);
      setLoading(false);
      return;
    }

    await savePayment({
      mealId: meal._id,
      price: meal.price,
      email: user.email,
      transactionId: paymentMethod.id,
      status: "paid",
    });

    setLoading(false);
    alert("Payment successful!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-4 border rounded-lg" />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        disabled={!stripe || loading}
        className="w-full bg-primary text-white py-3 rounded-xl"
      >
        {loading ? "Processing..." : `Pay ৳${meal.price}`}
      </button>
    </form>
  );
};

export default CheckoutForm;
