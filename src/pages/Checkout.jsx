import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  MapPin,
  CreditCard,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  Package,
  Truck,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { getCartItems } from "../api/cart.api";
import { placeBulkOrder } from "../api/order.api";
import Swal from "sweetalert2";

// Form schema - শুধু Address
const checkoutSchema = z.object({
  address: z.string().min(10, "Address must be at least 10 characters"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [directOrderItem, setDirectOrderItem] = useState(null);
  const [formData, setFormData] = useState({ address: "" });

  // Direct Order থেকে আসলে state check করুন
  useEffect(() => {
    if (location.state?.fromDirectOrder) {
      setDirectOrderItem({
        mealData: location.state.mealData,
        address: location.state.address,
        quantity: location.state.quantity,
      });
    }
  }, [location.state]);

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: directOrderItem?.address || user?.address || "",
    },
  });

  // Fetch cart items (যদি Direct Order না হয়)
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartItems,
    enabled: !directOrderItem && !!user,
  });

  // Calculate delivery fee
  const calculateDeliveryFee = () => {
    const subtotal = directOrderItem
      ? (directOrderItem.mealData.price * directOrderItem.quantity)
      : cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return subtotal > 0 ? 60 : 0;
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    if (directOrderItem) {
      return directOrderItem.mealData.price * directOrderItem.quantity;
    }
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Calculate total with delivery fee
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = calculateDeliveryFee();
    return subtotal + deliveryFee;
  };

  // Get item count
  const getItemCount = () => {
    return directOrderItem ? 1 : cartItems.length;
  };

  // Place order mutation
  const orderMutation = useMutation({
    mutationFn: placeBulkOrder,
    onSuccess: (data) => {
      // Navigate to Payment Page with order details
      const orderId = data.orderId || data.orderIds?.[0];
      
      if (orderId) {
        const subtotal = calculateSubtotal();
        const deliveryFee = calculateDeliveryFee();
        const totalAmount = subtotal + deliveryFee;
        const itemCount = getItemCount();
        const currentAddress = getValues().address;

        navigate(`/payment/${orderId}`, {
          state: {
            orderData: {
              // Order items
              items: directOrderItem ? [{
                mealId: directOrderItem.mealData._id,
                mealName: directOrderItem.mealData.foodName,
                price: directOrderItem.mealData.price,
                quantity: directOrderItem.quantity,
                chefId: directOrderItem.mealData.chefId,
                foodImage: directOrderItem.mealData.foodImage,
              }] : cartItems.map(item => ({
                mealId: item.mealId || item._id,
                mealName: item.mealName || item.foodName,
                price: item.price,
                quantity: item.quantity,
                chefId: item.chefId,
                chefName: item.chefName,
                foodImage: item.foodImage,
              })),

              // Order summary
              totalAmount: totalAmount,
              subtotal: subtotal,
              deliveryFee: deliveryFee,
              itemCount: itemCount,
              address: currentAddress,
              paymentMethod: "stripe",
              
              // Actual order ID for database reference
              orderId: orderId,
            },
          },
        });
      } else {
        Swal.fire({
          title: "Order Failed",
          text: "No order ID returned from server",
          icon: "error",
          confirmButtonColor: "#DF603A",
        }).then(() => {
          navigate("/checkout");
        });
      }
    },
    onError: (error) => {
      console.error("Order placement error:", error);
      
      Swal.fire({
        title: "Order Failed",
        text: error.response?.data?.message || error.message || "Failed to place order. Please try again.",
        icon: "error",
        confirmButtonColor: "#DF603A",
      });
    },
  });

  // Address field update
  useEffect(() => {
    if (directOrderItem?.address) {
      setValue("address", directOrderItem.address);
    }
  }, [directOrderItem, setValue]);

  const total = calculateTotal();

  const handleCheckoutSubmit = (formData) => {
    setFormData(formData);
    
    if ((!directOrderItem && cartItems.length === 0) || !user) {
      Swal.fire({
        title: "No Items",
        text: "Add items to cart before checkout",
        icon: "warning",
      });
      return;
    }

    // Prepare order data
    const orderData = {
      items: directOrderItem
        ? [{
            mealId: directOrderItem.mealData._id,
            mealName: directOrderItem.mealData.foodName,
            price: directOrderItem.mealData.price,
            quantity: directOrderItem.quantity,
            chefId: directOrderItem.mealData.chefId,
            foodImage: directOrderItem.mealData.foodImage,
          }]
        : cartItems.map(item => ({
            mealId: item.mealId || item._id,
            mealName: item.mealName || item.foodName,
            price: item.price,
            quantity: item.quantity,
            chefId: item.chefId,
            foodImage: item.foodImage,
          })),
      address: formData.address,
      totalAmount: total,
      paymentMethod: "stripe",
    };

    // Confirm order
    Swal.fire({
      title: "Confirm Order",
      html: `
        <div class="text-left space-y-2">
          <p><strong>Items:</strong> ${directOrderItem ? 1 : cartItems.length}</p>
          <p><strong>Subtotal:</strong> ৳${calculateSubtotal()}</p>
          <p><strong>Delivery Fee:</strong> ৳${calculateDeliveryFee()}</p>
          <p><strong>Total:</strong> ৳${total}</p>
          <p><strong>Payment:</strong> Card Payment via Stripe</p>
          <p><strong>Delivery to:</strong> ${formData.address.substring(0, 50)}...</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Proceed to Payment",
      cancelButtonText: "Review",
    }).then((result) => {
      if (result.isConfirmed) {
        orderMutation.mutate(orderData);
      }
    });
  };

  if (!user) {
    navigate("/auth", { state: { from: "/checkout" } });
    return null;
  }

  if (isLoading && !directOrderItem) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#DF603A]" />
      </div>
    );
  }

  const items = directOrderItem
    ? [{
        ...directOrderItem.mealData,
        quantity: directOrderItem.quantity,
      }]
    : cartItems;

  if (items.length === 0 && !directOrderItem) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="playfair-font text-2xl font-bold text-gray-800 mb-2">
            No items to checkout
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

  const subtotal = calculateSubtotal();
  const deliveryFee = calculateDeliveryFee();

  return (
    <div className="min-h-screen bg-[#FBFAF8] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(directOrderItem ? -1 : "/cart")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#DF603A] mb-4"
          >
            <ArrowLeft size={20} />
            {directOrderItem ? "Back to Order" : "Back to Cart"}
          </button>
          <h1 className="playfair-font text-4xl font-bold text-[#2D1B12]">
            Checkout
          </h1>
          <p className="text-gray-600 mt-2">
            Review your order and complete payment
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 border mb-6">
              <h2 className="text-xl font-semibold text-[#2D1B12] mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Summary
              </h2>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={item.foodImage}
                      alt={item.mealName || item.foodName}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {item.mealName || item.foodName}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            by {item.chefName || "Chef"}
                          </p>
                        </div>
                        <p className="text-[#DF603A] font-bold text-lg">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </span>
                        <span className="text-sm font-medium">
                          ৳{item.price} each
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-6 mt-6 border-t space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                  <span>Total Amount</span>
                  <span className="text-[#DF603A] text-2xl">৳{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Information Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border">
              <form onSubmit={handleSubmit(handleCheckoutSubmit)}>
                <h2 className="text-xl font-semibold text-[#2D1B12] mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      {...register("address")}
                      rows="3"
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      placeholder="Enter your delivery address"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  {/* Payment Method Info */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Payment Method</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Secure card payment via Stripe. You'll enter card details on the next page.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={orderMutation.isLoading}
                    className="w-full mt-6 bg-gradient-to-r from-[#DF603A] to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {orderMutation.isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-6 h-6" />
                        Proceed to Payment
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border sticky top-24">
              <h2 className="text-xl font-semibold text-[#2D1B12] mb-6">
                Order Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Items ready for checkout
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items</span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-blue-600">Card (Stripe)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium">30-45 min</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Payable</span>
                    <span className="text-[#DF603A] text-2xl">৳{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Delivery Notes
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Free delivery on orders over ৳500</li>
                    <li>• Estimated delivery time: 30-45 minutes</li>
                    <li>• Contactless delivery available</li>
                    <li>• Track order in your dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;