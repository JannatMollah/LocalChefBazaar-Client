import { useState } from "react";
import {
  Package,
  User,
  Mail,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Truck,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import axiosSecure from "../../../api/axiosSecure";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const OrderRequests = () => {
  const { user: firebaseUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch chef data
  const { data: chef } = useQuery({
    queryKey: ["chefData", firebaseUser?.email],
    queryFn: async () => {
      if (!firebaseUser?.email) return null;
      
      try {
        const response = await axiosSecure.get(`/users/${firebaseUser.email}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching chef data:", error);
        return null;
      }
    },
    enabled: !!firebaseUser?.email,
  });

  // Fetch chef orders
  const { 
    data: orders = [], 
    isLoading: ordersLoading,
    refetch: refetchOrders 
  } = useQuery({
    queryKey: ["chefOrders", chef?.chefId],
    queryFn: async () => {
      if (!chef?.chefId) return [];
      
      try {
        const response = await axiosSecure.get(`/orders/chef/${chef.chefId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching chef orders:", error);
        return [];
      }
    },
    enabled: !!chef?.chefId,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      await axiosSecure.patch(`/orders/status/${orderId}`, { status });
    },
    onSuccess: (_, variables) => {
      const statusMessages = {
        accepted: "Order has been accepted successfully",
        delivered: "Order has been marked as delivered",
        cancelled: "Order has been cancelled"
      };
      
      Swal.fire({
        title: "Status Updated!",
        text: statusMessages[variables.status] || "Order status has been updated successfully",
        icon: "success",
        confirmButtonColor: "#DF603A",
        timer: 2000,
        showConfirmButton: false,
      });
      refetchOrders();
      queryClient.invalidateQueries(["chefOrders", chef?.chefId]);
      queryClient.invalidateQueries(["chefStats", chef?.chefId]);
    },
    onError: (error) => {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update order status",
        icon: "error",
        confirmButtonColor: "#DF603A",
      });
    },
  });

  const handleAcceptOrder = (orderId) => {
    Swal.fire({
      title: "Accept Order?",
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-2">Are you sure you want to accept this order?</p>
          <div class="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3">
            <p class="text-sm text-blue-700">
              • Order will be marked as "Accepted"<br>
              • Customer will be notified<br>
              • You can start preparing the meal
            </p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Accept Order",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        updateOrderStatusMutation.mutate({ 
          orderId, 
          status: "accepted" 
        });
      }
    });
  };

  const handleDeliverOrder = (orderId) => {
    Swal.fire({
      title: "Deliver Order?",
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-2">Are you sure you want to mark this order as delivered?</p>
          <div class="bg-green-50 p-3 rounded-lg border border-green-200 mt-3">
            <p class="text-sm text-green-700">
              • Order will be marked as "Delivered"<br>
              • Customer will be notified<br>
              • This action cannot be undone
            </p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Mark as Delivered",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        updateOrderStatusMutation.mutate({ 
          orderId, 
          status: "delivered" 
        });
      }
    });
  };

  const handleCancelOrder = (orderId) => {
    Swal.fire({
      title: "Cancel Order?",
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-2">Are you sure you want to cancel this order?</p>
          <div class="bg-red-50 p-3 rounded-lg border border-red-200 mt-3">
            <p class="text-sm text-red-700">
              • Order will be marked as "Cancelled"<br>
              • Customer will be notified and refunded if paid<br>
              • This action cannot be undone
            </p>
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Cancel Order",
      cancelButtonText: "Go Back",
    }).then((result) => {
      if (result.isConfirmed) {
        updateOrderStatusMutation.mutate({ orderId, status: "cancelled" });
      }
    });
  };

  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (filter !== "all" && order.orderStatus !== filter) return false;
    
    // Search by meal name or user email
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.mealName?.toLowerCase().includes(searchLower) ||
        order.userEmail?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
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

  // Check if user is a chef
  if (chef?.role !== "chef") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Not Authorized</h2>
          <p className="text-gray-600 mb-6">
            You need to be a chef to view order requests.
          </p>
          <button
            onClick={() => window.location.href = "/dashboard/profile"}
            className="bg-[#DF603A] text-white px-6 py-3 rounded-xl hover:bg-[#c95232] transition"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#DF603A] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Loading Orders</h2>
          <p className="text-gray-600">Fetching your order requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="playfair-font text-4xl font-bold text-[#2D1B12] mb-2">
                Order Requests
              </h1>
              <p className="text-gray-600">Manage and process customer orders</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-[#DF603A] to-orange-500 text-white rounded-full font-semibold">
                Total Orders: {orders.length}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {orders.filter(o => o.orderStatus === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-blue-800">
                  {orders.filter(o => o.orderStatus === "accepted").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-800">
                  {orders.filter(o => o.orderStatus === "delivered").length}
                </p>
              </div>
              <Truck className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-800">
                  {orders.filter(o => o.orderStatus === "cancelled").length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
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
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by meal or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {orders.length === 0 ? "No orders yet" : "No matching orders"}
            </h3>
            <p className="text-gray-600 mb-6">
              {orders.length === 0 
                ? "You haven't received any orders yet. Promote your meals to get orders!" 
                : "Try a different search or filter."}
            </p>
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
                        <p className="text-sm text-gray-600">Customer</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{order.userEmail}</p>
                        <p className="text-xs text-gray-600 truncate">
                          Order placed {new Date(order.orderTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <p className="text-sm text-gray-600">Delivery Address</p>
                      </div>
                      <p className="font-medium text-sm">{order.userAddress}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-gray-600" />
                        <p className="text-sm text-gray-600">Payment Status</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.paymentStatus === "paid" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                        </span>
                        {order.paymentStatus === "pending" && order.orderStatus === "accepted" && (
                          <span className="text-xs text-blue-600">(Awaiting Payment)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t">
                    {order.orderStatus === "pending" && (
                      <>
                        <button
                          onClick={() => handleAcceptOrder(order._id)}
                          disabled={updateOrderStatusMutation.isLoading}
                          className="flex items-center gap-2 bg-[#DF603A] text-white px-4 py-2 rounded-xl hover:bg-[#c95232] transition disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept Order
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={updateOrderStatusMutation.isLoading}
                          className="flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Order
                        </button>
                      </>
                    )}
                    
                    {order.orderStatus === "accepted" && (
                      <>
                        <button
                          onClick={() => handleDeliverOrder(order._id)}
                          disabled={updateOrderStatusMutation.isLoading}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <Truck className="w-4 h-4" />
                          Mark as Delivered
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={updateOrderStatusMutation.isLoading}
                          className="flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Order
                        </button>
                      </>
                    )}
                    
                    {(order.orderStatus === "delivered" || order.orderStatus === "cancelled") && (
                      <div className="text-sm text-gray-600 italic">
                        Order {order.orderStatus} - No actions available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Status Guide */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Order Processing Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-blue-800">Pending</h4>
              </div>
              <p className="text-sm text-blue-700">
                New order received. Accept or cancel within 15 minutes.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-800">Accepted</h4>
              </div>
              <p className="text-sm text-blue-700">
                Order confirmed. Start preparation. Customer will make payment.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-blue-800">Delivered</h4>
              </div>
              <p className="text-sm text-blue-700">
                Order delivered to customer. Payment completed.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-blue-800">Cancelled</h4>
              </div>
              <p className="text-sm text-blue-700">
                Order cancelled. No further action required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderRequests;