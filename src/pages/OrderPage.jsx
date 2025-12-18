import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, ShoppingCart, Home } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { getMealById, placeOrder } from "../api/meal.api";
import Swal from "sweetalert2";

const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const { data: meal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => getMealById(id),
    enabled: !!id,
  });

  const orderMutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      Swal.fire({
        title: "Order Placed Successfully!",
        text: `Your total price is ৳${meal.price * quantity}.`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/dashboard/orders");
      });
    },
    onError: (error) => {
      Swal.fire({
        title: "Order Failed",
        text: error.response?.data?.message || "Something went wrong",
        icon: "error",
      });
    },
  });

  const handleOrder = () => {
    if (!user || !meal) return;

    Swal.fire({
      title: "Confirm Order",
      text: `Your total price is ৳${meal.price * quantity}. Do you want to confirm the order?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Confirm",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        const orderData = {
          foodId: meal._id,
          mealName: meal.foodName,
          price: meal.price,
          quantity: quantity,
          chefId: meal.chefId,
          userAddress: user.address || "",
          userEmail: user.email,
        };
        orderMutation.mutate(orderData);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#DF603A]" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Meal not found</h2>
          <button
            onClick={() => navigate("/meals")}
            className="mt-4 px-6 py-3 bg-[#DF603A] text-white rounded-xl"
          >
            Browse Meals
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = meal.price * quantity;

  return (
    <div className="min-h-screen bg-[#FBFAF8] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="playfair-font text-4xl font-bold text-[#2D1B12]">
            Place Your Order
          </h1>
          <p className="text-gray-600 mt-2">
            Confirm your order details and delivery information
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border">
            <h2 className="text-xl font-semibold text-[#2D1B12] mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={meal.foodImage}
                  alt={meal.foodName}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-semibold">{meal.foodName}</h3>
                  <p className="text-sm text-gray-500">by {meal.chefName}</p>
                  <p className="text-[#DF603A] font-bold text-lg">
                    ৳{meal.price} per serving
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full border flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="text-[#DF603A] font-bold text-2xl">
                    ৳{totalPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border">
            <h2 className="text-xl font-semibold text-[#2D1B12] mb-4">
              Delivery Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address
                </label>
                <textarea
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                  rows="3"
                  placeholder="Enter your full delivery address"
                  defaultValue={user.address || ""}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Make sure to include house number, road, and area
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl">
                <h3 className="font-semibold text-orange-800 mb-2">
                  Delivery Note
                </h3>
                <p className="text-sm text-orange-700">
                  • Estimated delivery: {meal.estimatedDeliveryTime}
                  <br />
                  • Delivery area: {meal.deliveryArea || "Dhaka City"}
                  <br />
                  • Contact: {user.email}
                </p>
              </div>

              <button
                onClick={handleOrder}
                disabled={orderMutation.isLoading}
                className="w-full bg-gradient-to-r from-[#DF603A] to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {orderMutation.isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    Confirm Order - ৳{totalPrice}
                  </>
                )}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="w-full border border-gray-300 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
              >
                Back to Meal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;