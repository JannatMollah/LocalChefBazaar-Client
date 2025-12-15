import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const Payment = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { id } = useParams(); // meal id

  const [meal, setMeal] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Load meal
  useEffect(() => {
    axios.get(`http://localhost:5000/meals/${id}`).then(res => {
      setMeal(res.data);
    });
  }, [id]);

  // 🔹 Create payment intent
  useEffect(() => {
    if (meal?.price) {
      axios.post(
        "http://localhost:5000/payments/create-intent",
        { price: meal.price },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access-token")}`,
          },
        }
      ).then(res => {
        setClientSecret(res.data.clientSecret);
      });
    }
  }, [meal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const card = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: { card },
      }
    );

    if (error) {
      setError(error.message);
      setProcessing(false);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      // 🔹 save payment in DB
      await axios.post(
        "http://localhost:5000/payments/success",
        {
          mealId: meal._id,
          amount: meal.price,
          transactionId: paymentIntent.id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access-token")}`,
          },
        }
      );

      navigate("/orders");
    }
  };

  if (!meal) return <p className="text-center py-20">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#FFF7F2] flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4 playfair-font">
          Pay for {meal.foodName}
        </h2>

        <p className="text-center text-lg mb-6">
          Price: <span className="font-bold text-orange-600">৳{meal.price}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Input */}
          <div className="border rounded-lg p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#32325d",
                    "::placeholder": { color: "#aab7c4" },
                  },
                  invalid: { color: "#fa755a" },
                },
              }}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* PAY BUTTON */}
          <button
            type="submit"
            disabled={!stripe || !clientSecret || processing}
            className="w-full bg-[#DF603A] hover:bg-[#c84f2d] text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {processing ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
