import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle,
  Loader2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { getCartItems, clearCart } from "../api/cart.api";
import { placeBulkOrder } from "../api/order.api";
import Swal from "sweetalert2";

// Form validation schema
const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Valid Bangladeshi phone number required"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  area: z.string().min(2, "Area is required"),
  city: z.string().min(2, "City is required"),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.enum(["cash", "card", "mobile"]),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [paymentStep, setPaymentStep] = useState("details"); // 'details' | 'payment' | 'success'

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartItems,
    enabled: !!user,
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.displayName || "",
      phone: "",
      address: user?.address || "",
      area: "Dhaka",
      city: "Dhaka",
      paymentMethod: "cash",
    },
  });

  // Place order mutation
  const orderMutation = useMutation({
    mutationFn: placeBulkOrder,
    onSuccess: (data) => {
      // Clear cart after successful order
      clearCart();
      queryClient.invalidateQueries(["cart"]);
      
      setPaymentStep("success");
      
      // Show success message
      setTimeout(() => {
        Swal.fire({
          title: "Order Confirmed!",
          text: `Order #${data.orderId} has been placed successfully`,
          icon: "success",
          confirmButtonColor: "#DF603A",
          confirmButtonText: "View Orders",
        }).then(() => {
          navigate("/dashboard/orders");
        });
      }, 1000);
    },
    onError: (error) => {
      Swal.fire({
        title: "Order Failed",
        text: error.response?.data?.message || "Something went wrong",
        icon: "error",
      });
    },
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 500 ? 0 : 60;
  const total = subtotal + deliveryFee;

  const paymentMethod = watch("paymentMethod");

  const handlePlaceOrder = (formData) => {
    if (cartItems.length === 0) {
      Swal.fire({
        title: "Cart Empty",
        text: "Add items to cart before checkout",
        icon: "warning",
      });
      return;
    }

    const orderData = {
      ...formData,
      items: cartItems,
      totalAmount: total,
      userEmail: user.email,
    };

    Swal.fire({
      title: "Confirm Order",
      html: `
        <div class="text-left">
          <p><strong>Total:</strong> ৳${total}</p>
          <p><strong>Items:</strong> ${cartItems.length}</p>
          <p><strong>Payment:</strong> ${formData.paymentMethod === "cash" ? "Cash on Delivery" : "Online Payment"}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Confirm Order",
      cancelButtonText: "Review",
    }).then((result) => {
      if (result.isConfirmed) {
        orderMutation.mutate(orderData);
      }
    });
  };

  const paymentMethods = [
    { id: "cash", label: "Cash on Delivery", icon: Banknote, color: "text-green-600" },
    { id: "card", label: "Credit/Debit Card", icon: CreditCard, color: "text-blue-600" },
    { id: "mobile", label: "Mobile Banking", icon: Wallet, color: "text-purple-600" },
  ];

  if (!user) {
    navigate("/auth", { state: { from: "/checkout" } });
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#DF603A]" />
      </div>
    );
  }

  if (cartItems.length === 0 && paymentStep !== "success") {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="playfair-font text-2xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add items to your cart before checkout.
          </p>
          <button
            onClick={() => navigate("/meals")}
            className="bg-[#DF603A] text-white px-6 py-3 rounded-xl"
          >
            Browse Meals
          </button>
        </div>
      </div>
    );
  }

  if (paymentStep === "success") {
    return (
      <div className="min-h-screen bg-[#FBFAF8] pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="playfair-font text-3xl font-bold text-[#2D1B12] mb-4">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. Your food is being prepared by our chefs.
            </p>
            <div className="bg-green-50 p-6 rounded-xl mb-8">
              <p className="font-semibold text-green-800 mb-2">
                Order Summary
              </p>
              <p className="text-green-700">
                • Total: ৳{total}
                <br />
                • Items: {cartItems.length}
                <br />
                • Estimated Delivery: 30-45 minutes
              </p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/dashboard/orders")}
                className="w-full bg-[#DF603A] text-white py-3 rounded-xl font-semibold"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full border border-gray-300 py-3 rounded-xl"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFAF8] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center w-full max-w-md">
            <div className="flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${paymentStep === "details" ? "bg-[#DF603A] text-white" : "bg-gray-200"}`}>
                1
              </div>
              <p className="text-center mt-2 text-sm">Details</p>
            </div>
            <div className="flex-1 h-1 bg-gray-300"></div>
            <div className="flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${paymentStep === "payment" ? "bg-[#DF603A] text-white" : "bg-gray-200"}`}>
                2
              </div>
              <p className="text-center mt-2 text-sm">Payment</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(handlePlaceOrder)} className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border">
                <h2 className="text-xl font-semibold text-[#2D1B12] mb-4 flex items-center gap-2">
                  <User size={20} />
                  Personal Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register("fullName")}
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      placeholder="Your full name"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      {...register("phone")}
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      placeholder="01XXXXXXXXX"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border">
                <h2 className="text-xl font-semibold text-[#2D1B12] mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Delivery Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Address *
                    </label>
                    <textarea
                      {...register("address")}
                      rows="3"
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      placeholder="House, Road, Block, Area"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area *
                      </label>
                      <select
                        {...register("area")}
                        className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      >
                        <option value="Dhaka">Dhaka</option>
                        <option value="Mirpur">Mirpur</option>
                        <option value="Gulshan">Gulshan</option>
                        <option value="Banani">Banani</option>
                        <option value="Uttara">Uttara</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        {...register("city")}
                        className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                        readOnly
                        value="Dhaka"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      {...register("deliveryInstructions")}
                      rows="2"
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      placeholder="Any special instructions for delivery"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border">
                <h2 className="text-xl font-semibold text-[#2D1B12] mb-4">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${
                        paymentMethod === method.id
                          ? "border-[#DF603A] bg-orange-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        {...register("paymentMethod")}
                        value={method.id}
                        className="hidden"
                      />
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        paymentMethod === method.id
                          ? "border-[#DF603A] bg-[#DF603A]"
                          : "border-gray-300"
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <method.icon className={`w-5 h-5 ${method.color}`} />
                      <span className="font-medium">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="px-6 py-3 border rounded-xl"
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  disabled={orderMutation.isLoading}
                  className="flex-1 bg-gradient-to-r from-[#DF603A] to-orange-500 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {orderMutation.isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Place Order - ৳${total}`
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border sticky top-24">
              <h2 className="text-xl font-semibold text-[#2D1B12] mb-6">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <img
                      src={item.foodImage}
                      alt={item.mealName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.mealName}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-[#DF603A] font-semibold">
                        ৳{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">৳{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium">৳{deliveryFee}</span>
                </div>
                {subtotal > 500 && (
                  <div className="flex justify-between text-green-600">
                    <span>Delivery Discount</span>
                    <span>-৳60</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-3">
                  <span>Total</span>
                  <span className="text-[#DF603A] text-2xl">৳{total}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-2">Delivery Info</h3>
                <p className="text-sm text-gray-600">
                  <Phone className="inline w-4 h-4 mr-1" />
                  {user?.phone || "Will call when delivered"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  {watch("area")}, {watch("city")}
                </p>
                <p className="text-sm text-green-600 mt-3">
                  ✓ Estimated delivery: 30-45 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;