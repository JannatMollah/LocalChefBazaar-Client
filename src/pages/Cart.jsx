import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ChefHat,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { getCartItems, updateCartItem, removeCartItem, clearCart } from "../api/cart.api";
import Swal from "sweetalert2";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartItems,
    enabled: !!user,
  });

  // Update quantity mutation
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
    },
  });

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      Swal.fire({
        title: "Removed!",
        text: "Item removed from cart",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      Swal.fire({
        title: "Cart Cleared!",
        text: "All items removed from cart",
        icon: "info",
        timer: 1500,
        showConfirmButton: false,
      });
    },
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 60 : 0;
  const total = subtotal + deliveryFee;

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeMutation.mutate(itemId);
    } else {
      updateMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (itemId, itemName) => {
    Swal.fire({
      title: "Remove Item?",
      text: `Remove "${itemName}" from cart?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        removeMutation.mutate(itemId);
      }
    });
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;

    Swal.fire({
      title: "Clear Cart?",
      text: "Remove all items from cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, clear all",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        clearCartMutation.mutate();
      }
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Swal.fire({
        title: "Cart Empty",
        text: "Add items to cart before checkout",
        icon: "warning",
      });
      return;
    }
    navigate("/checkout");
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="playfair-font text-2xl font-bold text-gray-800 mb-2">
            Please Login First
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your cart.
          </p>
          <Link
            to="/auth"
            className="inline-block bg-[#DF603A] text-white px-6 py-3 rounded-xl"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#DF603A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFAF8] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="playfair-font text-4xl font-bold text-[#2D1B12]">
            Your Shopping Cart
          </h1>
          <p className="text-gray-600 mt-2">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="playfair-font text-2xl font-bold text-gray-800 mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any delicious meals to your cart yet.
            </p>
            <Link
              to="/meals"
              className="inline-flex items-center gap-2 bg-[#DF603A] text-white px-6 py-3 rounded-xl hover:shadow-lg transition"
            >
              <ChefHat size={20} />
              Browse Meals
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#2D1B12]">
                  Cart Items ({cartItems.length})
                </h2>
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-sm p-6 border"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.foodImage}
                      alt={item.mealName}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-[#2D1B12]">
                            {item.mealName}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            by {item.chefName}
                          </p>
                          <p className="text-[#DF603A] font-bold text-xl mt-2">
                            ৳{item.price}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item._id, item.mealName)}
                          className="text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                            disabled={updateMutation.isLoading}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-lg font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                            disabled={updateMutation.isLoading}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Subtotal</p>
                          <p className="text-xl font-bold text-[#DF603A]">
                            ৳{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 border sticky top-24">
                <h2 className="text-xl font-semibold text-[#2D1B12] mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">৳{deliveryFee}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="text-[#DF603A] font-bold text-2xl">
                        ৳{total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-[#DF603A] to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-3"
                  >
                    Proceed to Checkout
                    <ArrowRight size={20} />
                  </button>

                  <Link
                    to="/meals"
                    className="block text-center border border-gray-300 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                  >
                    Continue Shopping
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t text-sm text-gray-500">
                  <p className="mb-2">✓ Free delivery on orders over ৳500</p>
                  <p>✓ Estimated delivery: 30-45 minutes</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;