import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  Filter,
  Eye,
  Star,
  Calendar,
  CreditCard,
  MapPin,
  User,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import axiosSecure from "../../../api/axiosSecure";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch user orders
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["userOrders"],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get("/orders/my");
        return response.data;
      } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
    },
  });

  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (filter !== "all" && order.orderStatus !== filter) return false;
    
    // Search by meal name
    if (searchTerm && !order.mealName?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "delivered":
        return <Truck className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    });

    if (result.isConfirmed) {
      try {
        await axiosSecure.patch(`/orders/status/${orderId}`, { status: "cancelled" });
        Swal.fire("Cancelled!", "Your order has been cancelled.", "success");
        refetch();
      } catch (error) {
        Swal.fire("Error!", error.response?.data?.message || "Failed to cancel order", "error");
      }
    }
  };

  const handleAddReview = (order) => {
    Swal.fire({
      title: "Add Review",
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select id="rating" class="w-full border rounded-lg p-2">
              <option value="5">⭐⭐⭐⭐⭐ (5)</option>
              <option value="4">⭐⭐⭐⭐ (4)</option>
              <option value="3">⭐⭐⭐ (3)</option>
              <option value="2">⭐⭐ (2)</option>
              <option value="1">⭐ (1)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea id="comment" rows="3" class="w-full border rounded-lg p-2" placeholder="Share your experience..."></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Submit Review",
      preConfirm: () => {
        const rating = document.getElementById("rating").value;
        const comment = document.getElementById("comment").value;
        
        if (!rating || !comment) {
          Swal.showValidationMessage("Please fill all fields");
          return false;
        }
        
        return { rating, comment, foodId: order.foodId, mealName: order.mealName };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosSecure.post("/reviews", result.value);
          Swal.fire("Success!", "Your review has been submitted.", "success");
        } catch (error) {
          Swal.fire("Error!", error.response?.data?.message || "Failed to submit review", "error");
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#DF603A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFAF8] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="playfair-font text-4xl font-bold text-[#2D1B12] mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">Track and manage all your orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-[#2D1B12]">{orders.length}</p>
              </div>
              <Package className="w-8 h-8 text-[#DF603A]" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-[#2D1B12]">
                  {orders.filter(o => o.orderStatus === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-[#2D1B12]">
                  {orders.filter(o => o.orderStatus === "delivered").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-[#2D1B12]">
                  {orders.filter(o => o.orderStatus === "cancelled").length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-4 mb-6 border shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by meal name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 mb-6">
              {orders.length === 0 
                ? "You haven't placed any orders yet." 
                : "No orders match your search criteria."}
            </p>
            <Link
              to="/meals"
              className="inline-block bg-[#DF603A] text-white px-6 py-3 rounded-xl hover:bg-[#c95232] transition"
            >
              Browse Meals
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#2D1B12]">
                          {order.mealName}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.orderTime).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>Order #{order._id.slice(-8)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#DF603A]">
                        ৳{(order.price * (order.quantity || 1)).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ৳{order.price} × {order.quantity || 1}
                      </p>
                    </div>
                  </div>
                  
                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <p className="text-sm text-gray-600">Chef</p>
                      </div>
                      <p className="font-medium">{order.chefName || "Local Chef"}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        <p className="text-sm text-gray-600">Payment</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.paymentStatus === "paid" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                        </span>
                        <span className="text-sm text-gray-600">
                          {order.paymentMethod === "stripe" ? "(Card)" : "(Cash)"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <p className="text-sm text-gray-600">Delivery Address</p>
                      </div>
                      <p className="font-medium text-sm">{order.userAddress}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t">
                    <button
                      onClick={() => handleAddReview(order)}
                      disabled={order.orderStatus !== "delivered"}
                      className="flex items-center gap-2 bg-[#DF603A] text-white px-4 py-2 rounded-xl hover:bg-[#c95232] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Star className="w-4 h-4" />
                      Add Review
                    </button>
                    
                    <Link
                      to={`/meals/${order.foodId}`}
                      className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                    >
                      <Eye className="w-4 h-4" />
                      View Meal
                    </Link>
                    
                    {order.orderStatus === "pending" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Order
                      </button>
                    )}
                    
                    {order.orderStatus === "delivered" && (
                      <button className="flex items-center gap-2 border border-green-300 text-green-600 px-4 py-2 rounded-xl hover:bg-green-50 transition">
                        <Truck className="w-4 h-4" />
                        Track Delivery
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;