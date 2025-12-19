import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  User,
  Calendar,
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  XCircle,
  Home,
  Navigation,
  Phone,
  MessageSquare,
  Share2,
  Download,
  Printer,
} from "lucide-react";
import axiosSecure from "../../../api/axiosSecure";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const TrackOrder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // Fetch user orders
  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery({
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

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (filter !== "all" && order.orderStatus !== filter) return false;
    
    // Search by order ID or meal name
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order._id.toLowerCase().includes(searchLower) ||
        order.mealName?.toLowerCase().includes(searchLower) ||
        order.orderId?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Get status configuration
  const getStatusConfig = (status) => {
    const statuses = {
      pending: {
        color: "bg-yellow-500",
        text: "text-yellow-800",
        bg: "bg-yellow-100",
        icon: Clock,
        description: "Order placed, waiting for chef confirmation",
        steps: [
          { title: "Order Placed", completed: true },
          { title: "Chef Confirmation", completed: false },
          { title: "Preparation", completed: false },
          { title: "Delivery", completed: false },
        ]
      },
      accepted: {
        color: "bg-blue-500",
        text: "text-blue-800",
        bg: "bg-blue-100",
        icon: CheckCircle,
        description: "Chef accepted your order, preparing now",
        steps: [
          { title: "Order Placed", completed: true },
          { title: "Chef Confirmation", completed: true },
          { title: "Preparation", completed: false },
          { title: "Delivery", completed: false },
        ]
      },
      preparing: {
        color: "bg-purple-500",
        text: "text-purple-800",
        bg: "bg-purple-100",
        icon: Package,
        description: "Chef is preparing your meal",
        steps: [
          { title: "Order Placed", completed: true },
          { title: "Chef Confirmation", completed: true },
          { title: "Preparation", completed: true },
          { title: "Delivery", completed: false },
        ]
      },
      delivered: {
        color: "bg-green-500",
        text: "text-green-800",
        bg: "bg-green-100",
        icon: Truck,
        description: "Order delivered successfully",
        steps: [
          { title: "Order Placed", completed: true },
          { title: "Chef Confirmation", completed: true },
          { title: "Preparation", completed: true },
          { title: "Delivery", completed: true },
        ]
      },
      cancelled: {
        color: "bg-red-500",
        text: "text-red-800",
        bg: "bg-red-100",
        icon: XCircle,
        description: "Order has been cancelled",
        steps: [
          { title: "Order Placed", completed: true },
          { title: "Chef Confirmation", completed: false },
          { title: "Preparation", completed: false },
          { title: "Delivery", completed: false },
        ]
      }
    };
    
    return statuses[status] || statuses.pending;
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate estimated delivery time
  const calculateETA = (orderTime, status) => {
    const orderDate = new Date(orderTime);
    const eta = new Date(orderDate);
    
    switch(status) {
      case 'pending':
        eta.setMinutes(eta.getMinutes() + 45);
        break;
      case 'accepted':
        eta.setMinutes(eta.getMinutes() + 35);
        break;
      case 'preparing':
        eta.setMinutes(eta.getMinutes() + 25);
        break;
      case 'delivered':
        return "Delivered";
      default:
        eta.setMinutes(eta.getMinutes() + 45);
    }
    
    return `~${formatTime(eta)}`;
  };

  // Get order timeline events
  const getTimelineEvents = (order) => {
    const events = [
      {
        title: "Order Placed",
        time: order.orderTime,
        description: "Your order has been placed successfully",
        completed: true
      }
    ];

    if (order.orderStatus === "accepted" || order.orderStatus === "preparing" || order.orderStatus === "delivered") {
      events.push({
        title: "Chef Confirmed",
        time: order.orderTime,
        description: "Chef has accepted your order",
        completed: true
      });
    }

    if (order.orderStatus === "preparing" || order.orderStatus === "delivered") {
      events.push({
        title: "Preparation Started",
        time: order.orderTime,
        description: "Chef is preparing your meal",
        completed: true
      });
    }

    if (order.orderStatus === "delivered") {
      events.push({
        title: "Order Delivered",
        time: order.paymentTime || order.orderTime,
        description: "Your order has been delivered",
        completed: true
      });
    }

    return events;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#DF603A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-indigo-50/30 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="playfair-font text-4xl font-bold text-gray-800 mb-2">
              Order Tracking
            </h1>
            <p className="text-gray-600">Track and monitor all your orders in real-time</p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-800">
                  {orders.filter(o => o.orderStatus === "pending" || o.orderStatus === "accepted" || o.orderStatus === "preparing").length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-green-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-800">
                  {orders.filter(o => o.orderStatus === "delivered").length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-800">
                  ৳{orders.reduce((sum, o) => sum + (o.price * (o.quantity || 1)), 0).toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl p-4 border border-yellow-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Delivery</p>
                <p className="text-2xl font-bold text-gray-800">35min</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Navigation className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl p-4 mb-6 border border-blue-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="preparing">Preparing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID or meal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-12 text-center border border-blue-200"
          >
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              <Home className="w-5 h-5" />
              Browse Meals
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => {
              const statusConfig = getStatusConfig(order.orderStatus);
              const StatusIcon = statusConfig.icon;
              const timelineEvents = getTimelineEvents(order);
              
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-blue-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${statusConfig.bg}`}>
                          <StatusIcon className={`w-6 h-6 ${statusConfig.text}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {order.mealName}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(order.orderTime)}
                            </span>
                            <span>•</span>
                            <span>Order ID: {order._id.slice(-8).toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          ৳{(order.price * (order.quantity || 1)).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ৳{order.price} × {order.quantity || 1} item
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6">
                    {/* Status Progress */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
                          <span className={`font-semibold ${statusConfig.text}`}>
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          ETA: {calculateETA(order.orderTime, order.orderStatus)}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">{statusConfig.description}</p>
                      </div>
                      
                      {/* Progress Steps */}
                      <div className="relative mt-8">
                        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200"></div>
                        <div className={`absolute top-4 left-0 h-1 ${statusConfig.color} transition-all duration-500`}
                          style={{ 
                            width: order.orderStatus === 'pending' ? '25%' : 
                                   order.orderStatus === 'accepted' ? '50%' :
                                   order.orderStatus === 'preparing' ? '75%' : 
                                   order.orderStatus === 'delivered' ? '100%' : '0%' 
                          }}>
                        </div>
                        
                        <div className="relative flex justify-between">
                          {statusConfig.steps.map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                                step.completed ? statusConfig.bg : 'bg-gray-200'
                              }`}>
                                {step.completed ? (
                                  <CheckCircle className={`w-5 h-5 ${statusConfig.text}`} />
                                ) : (
                                  <span className="text-sm text-gray-500">{idx + 1}</span>
                                )}
                              </div>
                              <span className={`text-xs mt-2 font-medium ${
                                step.completed ? statusConfig.text : 'text-gray-500'
                              }`}>
                                {step.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Order Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <p className="text-sm text-gray-600">Chef</p>
                        </div>
                        <p className="font-medium text-blue-800">{order.chefName || "Local Chef"}</p>
                        <button className="text-sm text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          Contact Chef
                        </button>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-gray-600">Delivery Address</p>
                        </div>
                        <p className="font-medium text-green-800 text-sm">{order.userAddress}</p>
                        <button className="text-sm text-green-600 hover:text-green-800 mt-1 flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          View on Map
                        </button>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-4 h-4 text-purple-600" />
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
                            {order.paymentMethod === "stripe" ? "Card" : "Cash on Delivery"}
                          </span>
                        </div>
                        {order.paymentStatus === "paid" && (
                          <p className="text-xs text-gray-600 mt-1">
                            Paid at {order.paymentTime ? formatTime(order.paymentTime) : "N/A"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-800 mb-4">Order Timeline</h4>
                      <div className="space-y-4">
                        {timelineEvents.map((event, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={`w-3 h-3 rounded-full mt-1 ${event.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium text-gray-800">{event.title}</p>
                                <span className="text-sm text-gray-500">
                                  {formatTime(event.time)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-blue-100">
                      <Link
                        to={`/meals/${order.foodId}`}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Rate & Review
                      </Link>
                      
                      <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
                        <Share2 className="w-4 h-4" />
                        Share Order
                      </button>
                      
                      <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
                        <Download className="w-4 h-4" />
                        Download Invoice
                      </button>
                      
                      <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
                        <Printer className="w-4 h-4" />
                        Print Receipt
                      </button>
                      
                      {order.orderStatus === "pending" && (
                        <Link
                          to={`/dashboard/orders?cancel=${order._id}`}
                          className="flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Order
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        {filteredOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Need Help with Your Order?</h3>
                <p className="text-blue-100">Our support team is available 24/7</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all">
                  <Phone className="w-4 h-4" />
                  Call Support
                </button>
                <button className="flex items-center gap-2 border border-white text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all">
                  <MessageSquare className="w-4 h-4" />
                  Live Chat
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;