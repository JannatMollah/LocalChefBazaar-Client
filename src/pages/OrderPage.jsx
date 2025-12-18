import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  ShoppingCart,
  Package,
  ArrowRight,
  Plus,
  Minus,
  ChefHat,
  Clock,
  Star,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { getMealById } from "../api/meal.api";
import { addToCart } from "../api/cart.api";
import Swal from "sweetalert2";

// Form validation schema - শুধু Quantity লাগবে
const orderSchema = z.object({
  quantity: z.number().min(1).max(10),
});

const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  // Fetch meal details
  const { data: meal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => getMealById(id),
    enabled: !!id,
  });

  // Add to cart mutation
  const cartMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: (data, variables) => {
      // Redirect to Checkout Page
      navigate("/checkout", {
        state: {
          fromDirectOrder: true,
          mealData: meal,
          quantity: variables.quantity,
        },
      });
    },
    onError: (error) => {
      Swal.fire({
        title: "Failed to Add to Cart",
        text: error.response?.data?.message || "Something went wrong",
        icon: "error",
      });
      setLoading(false);
    },
  });

  const quantity = watch("quantity");
  const totalPrice = meal ? meal.price * quantity : 0;

  const handleOrderSubmit = (formData) => {
    if (!user || !meal) return;

    setLoading(true);

    // Direct Order Button Clicked => Auto Add to Cart
    const cartItem = {
      mealId: meal._id,
      mealName: meal.foodName,
      price: meal.price,
      foodImage: meal.foodImage,
      chefName: meal.chefName,
      chefId: meal.chefId,
      quantity: formData.quantity,
      isDirectOrder: true,
    };

    // Add to cart
    cartMutation.mutate(cartItem);
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

  return (
    <div className="min-h-screen bg-[#FBFAF8] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="playfair-font text-4xl font-bold text-[#2D1B12]">
            Direct Order
          </h1>
          <p className="text-gray-600 mt-2">
            Quick order for <span className="font-semibold text-[#DF603A]">{meal.foodName}</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Meal Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 border">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Meal Image */}
                <div className="md:w-2/5">
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={meal.foodImage}
                      alt={meal.foodName}
                      className="w-full h-64 md:h-80 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{meal.rating || "4.5"}</span>
                    </div>
                  </div>
                  
                  {/* Chef Info */}
                  <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DF603A] to-orange-400 flex items-center justify-center">
                        <ChefHat className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{meal.chefName}</p>
                        <p className="text-sm text-gray-500">Chef ID: {meal.chefId}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      {meal.chefExperience}
                    </p>
                  </div>
                </div>

                {/* Meal Info */}
                <div className="md:w-3/5">
                  <h2 className="playfair-font text-3xl font-bold text-[#2D1B12] mb-4">
                    {meal.foodName}
                  </h2>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{meal.estimatedDeliveryTime}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <span className="text-gray-600">{meal.deliveryArea || "Dhaka"}</span>
                  </div>

                  <p className="text-gray-600 mb-6">
                    {meal.description || "A delicious homemade meal prepared with care and fresh ingredients."}
                  </p>

                  {/* Ingredients */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                      {meal.ingredients?.map((ingredient, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-gradient-to-r from-[#FFF5F0] to-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Price per serving</p>
                        <p className="playfair-font text-4xl font-bold text-[#DF603A] mt-1">
                          ৳{meal.price}
                          <span className="text-lg text-gray-400 ml-2">/serving</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-sm">Total</p>
                        <p className="text-3xl font-bold text-[#2D1B12]">
                          ৳{totalPrice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border sticky top-24">
              <h2 className="text-xl font-semibold text-[#2D1B12] mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Quantity
              </h2>

              <form onSubmit={handleSubmit(handleOrderSubmit)} className="space-y-6">
                {/* Quantity Selector */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                    How many servings?
                  </label>
                  
                  <div className="flex items-center justify-center gap-6">
                    <button
                      type="button"
                      onClick={() => setValue("quantity", Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-[#DF603A] transition"
                    >
                      <Minus className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    <div className="text-center">
                      <span className="text-5xl font-bold text-[#2D1B12] block">
                        {quantity}
                      </span>
                      <span className="text-sm text-gray-500 mt-1 block">
                        {quantity === 1 ? 'serving' : 'servings'}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setValue("quantity", Math.min(10, quantity + 1))}
                      className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-[#DF603A] transition"
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  
                  <input
                    type="hidden"
                    {...register("quantity", { valueAsNumber: true })}
                  />
                  
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-3 text-center">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Price</span>
                    <span className="font-medium">৳{meal.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                    <span>Total Amount</span>
                    <span className="text-[#DF603A] text-2xl">৳{totalPrice}</span>
                  </div>
                </div>

                {/* Next Steps Info */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Next Steps
                  </h3>
                  <ol className="text-sm text-blue-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>Add to cart with selected quantity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span>Go to checkout page for address & payment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span>Complete secure card payment</span>
                    </li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading || cartMutation.isLoading}
                    className="w-full bg-gradient-to-r from-[#DF603A] to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group"
                  >
                    {loading || cartMutation.isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding to Cart...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        Add to Cart & Continue
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full border-2 border-gray-300 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition"
                  >
                    Back to Meal Details
                  </button>
                </div>
              </form>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#2D1B12]">
                      {meal.rating || "4.5"}
                    </p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#2D1B12]">
                      {meal.estimatedDeliveryTime?.split(" ")[0] || "30"}
                    </p>
                    <p className="text-xs text-gray-500">Minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;