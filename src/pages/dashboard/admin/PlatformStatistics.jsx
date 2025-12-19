import { useState } from "react";
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Loader2,
  ChefHat,
  UserCheck,
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import axiosSecure from "../../../api/axiosSecure";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const PlatformStatistics = () => {
  const { user: firebaseUser } = useAuth();
  const [timeRange, setTimeRange] = useState("monthly");

  // Fetch current admin data
  const { data: currentAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["adminData", firebaseUser?.email],
    queryFn: async () => {
      if (!firebaseUser?.email) return null;
      try {
        const response = await axiosSecure.get(`/users/${firebaseUser.email}`);
        return response.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!firebaseUser?.email,
  });

  // Fetch platform statistics
  const { 
    data: stats, 
    isLoading: statsLoading,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ["platformStats"],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get("/stats");
        return response.data;
      } catch (error) {
        console.error("Stats fetch error:", error);
        return {
          totalUsers: 0,
          ordersPending: 0,
          ordersDelivered: 0,
          totalPayment: 0
        };
      }
    },
  });

  // Fetch all users for detailed analysis
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get("/users");
        return response.data;
      } catch (error) {
        console.error("Users fetch error:", error);
        return [];
      }
    },
    enabled: currentAdmin?.role === "admin",
  });

  // Fetch all orders for detailed analysis
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["allOrders"],
    queryFn: async () => {
      try {
        // First try to get all orders
        const response = await axiosSecure.get("/orders");
        return response.data;
      } catch (error) {
        console.error("Orders fetch error:", error);
        return [];
      }
    },
    enabled: currentAdmin?.role === "admin",
  });

  // Fetch all payments for revenue analysis
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["allPayments"],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get("/payments/history");
        return response.data;
      } catch (error) {
        console.error("Payments fetch error:", error);
        return [];
      }
    },
    enabled: currentAdmin?.role === "admin",
  });

  // Calculate comprehensive statistics from real data
  const calculatePlatformStats = () => {
    if (!usersData || !ordersData) {
      return {
        totalUsers: 0,
        totalChefs: 0,
        totalAdmins: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        acceptedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        paidOrders: 0,
        pendingPayments: 0,
        failedPayments: 0,
        averageOrderValue: 0,
        paymentSuccessRate: 0,
        orderCompletionRate: 0,
        activeUsers: 0,
        activeChefs: 0,
        fraudUsers: 0,
      };
    }

    // User statistics
    const totalUsers = usersData.length;
    const totalChefs = usersData.filter(u => u.role === "chef").length;
    const totalAdmins = usersData.filter(u => u.role === "admin").length;
    const activeUsers = usersData.filter(u => u.status === "active").length;
    const activeChefs = usersData.filter(u => u.role === "chef" && u.status === "active").length;
    const fraudUsers = usersData.filter(u => u.status === "fraud").length;

    // Order statistics
    const totalOrders = ordersData.length;
    const pendingOrders = ordersData.filter(o => o.orderStatus === "pending").length;
    const acceptedOrders = ordersData.filter(o => o.orderStatus === "accepted").length;
    const deliveredOrders = ordersData.filter(o => o.orderStatus === "delivered").length;
    const cancelledOrders = ordersData.filter(o => o.orderStatus === "cancelled").length;
    
    // Payment statistics
    const paidOrders = ordersData.filter(o => o.paymentStatus === "paid").length;
    const pendingPayments = ordersData.filter(o => o.paymentStatus === "pending").length;
    const failedPayments = ordersData.filter(o => o.paymentStatus === "failed").length;
    
    // REVENUE CALCULATION: Only from delivered orders
    const totalRevenue = ordersData
      .filter(order => order.orderStatus === "delivered")
      .reduce((sum, order) => {
        const price = order.price || 0;
        const quantity = order.quantity || 1;
        return sum + (price * quantity);
      }, 0);
    
    // Calculate rates
    const averageOrderValue = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;
    const paymentSuccessRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;
    const orderCompletionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

    return {
      totalUsers,
      totalChefs,
      totalAdmins,
      totalOrders,
      totalRevenue, // Now calculated from delivered orders
      pendingOrders,
      acceptedOrders,
      deliveredOrders,
      cancelledOrders,
      paidOrders,
      pendingPayments,
      failedPayments,
      averageOrderValue,
      paymentSuccessRate,
      orderCompletionRate,
      activeUsers,
      activeChefs,
      fraudUsers,
    };
  };

  const platformStats = calculatePlatformStats();

  // Calculate growth metrics (30 days comparison)
  const calculateGrowthMetrics = () => {
    if (!usersData || !ordersData) {
      return {
        userGrowth: 0,
        chefGrowth: 0,
        orderGrowth: 0,
        revenueGrowth: 0,
        newUsers30Days: 0,
        newChefs30Days: 0,
        newOrders30Days: 0,
        newRevenue30Days: 0,
      };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // New users/chefs in last 30 days
    const newUsers30Days = usersData.filter(u => {
      const userDate = new Date(u.createdAt || u.updatedAt);
      return userDate > thirtyDaysAgo;
    }).length;

    const newChefs30Days = usersData.filter(u => {
      const userDate = new Date(u.createdAt || u.updatedAt);
      return u.role === "chef" && userDate > thirtyDaysAgo;
    }).length;

    // New orders in last 30 days
    const newOrders30Days = ordersData.filter(o => {
      const orderDate = new Date(o.orderTime);
      return orderDate > thirtyDaysAgo;
    }).length;

    // New revenue in last 30 days - Only from delivered orders
    const newRevenue30Days = ordersData
      .filter(o => {
        const orderDate = new Date(o.orderTime);
        return o.orderStatus === "delivered" && orderDate > thirtyDaysAgo;
      })
      .reduce((sum, order) => {
        const price = order.price || 0;
        const quantity = order.quantity || 1;
        return sum + (price * quantity);
      }, 0);

    // Calculate totals before 30 days
    const totalUsersBefore30Days = platformStats.totalUsers - newUsers30Days;
    const totalChefsBefore30Days = platformStats.totalChefs - newChefs30Days;
    const totalOrdersBefore30Days = platformStats.totalOrders - newOrders30Days;
    const totalRevenueBefore30Days = platformStats.totalRevenue - newRevenue30Days;

    // Calculate growth rates
    const userGrowth = totalUsersBefore30Days > 0 
      ? ((newUsers30Days / totalUsersBefore30Days) * 100) 
      : newUsers30Days > 0 ? 100 : 0;

    const chefGrowth = totalChefsBefore30Days > 0
      ? ((newChefs30Days / totalChefsBefore30Days) * 100)
      : newChefs30Days > 0 ? 100 : 0;

    const orderGrowth = totalOrdersBefore30Days > 0
      ? ((newOrders30Days / totalOrdersBefore30Days) * 100)
      : newOrders30Days > 0 ? 100 : 0;

    const revenueGrowth = totalRevenueBefore30Days > 0
      ? ((newRevenue30Days / totalRevenueBefore30Days) * 100)
      : newRevenue30Days > 0 ? 100 : 0;

    return {
      userGrowth: userGrowth.toFixed(1),
      chefGrowth: chefGrowth.toFixed(1),
      orderGrowth: orderGrowth.toFixed(1),
      revenueGrowth: revenueGrowth.toFixed(1),
      newUsers30Days,
      newChefs30Days,
      newOrders30Days,
      newRevenue30Days,
    };
  };

  const growthMetrics = calculateGrowthMetrics();

  // Prepare data for charts
  const chartData = {
    userDistribution: usersData ? [
      { name: "Users", value: platformStats.totalUsers - platformStats.totalChefs - platformStats.totalAdmins, color: "#3b82f6" },
      { name: "Chefs", value: platformStats.totalChefs, color: "#f97316" },
      { name: "Admins", value: platformStats.totalAdmins, color: "#8b5cf6" },
    ] : [],

    orderStatusDistribution: [
      { status: "Pending", count: platformStats.pendingOrders, color: "#f59e0b" },
      { status: "Accepted", count: platformStats.acceptedOrders, color: "#3b82f6" },
      { status: "Delivered", count: platformStats.deliveredOrders, color: "#10b981" },
      { status: "Cancelled", count: platformStats.cancelledOrders, color: "#ef4444" },
    ],

    paymentStatusDistribution: [
      { status: "Paid", count: platformStats.paidOrders, color: "#10b981" },
      { status: "Pending", count: platformStats.pendingPayments, color: "#f59e0b" },
      { status: "Failed", count: platformStats.failedPayments, color: "#ef4444" },
    ],

    revenueByMonth: ordersData ? processRevenueByMonth(ordersData) : [],
  };

  // Process revenue by month from delivered orders
  function processRevenueByMonth(orders) {
    const monthlyData = {};
    
    const deliveredOrders = orders.filter(order => order.orderStatus === "delivered");
    
    deliveredOrders.forEach(order => {
      if (order.orderTime) {
        const date = new Date(order.orderTime);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: getMonthName(date.getMonth()),
            year: date.getFullYear(),
            revenue: 0,
            orders: 0,
          };
        }
        
        const price = order.price || 0;
        const quantity = order.quantity || 1;
        monthlyData[monthYear].revenue += (price * quantity);
        monthlyData[monthYear].orders += 1;
      }
    });

    return Object.values(monthlyData)
      .sort((a, b) => a.year - b.year || a.month.localeCompare(b.month))
      .slice(-6);
  }

  function getMonthName(monthIndex) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return months[monthIndex];
  }

  // Handle data export
  const handleExportData = () => {
    const dataToExport = {
      platformStats,
      growthMetrics,
      userDistribution: chartData.userDistribution,
      orderStatusDistribution: chartData.orderStatusDistribution,
      paymentStatusDistribution: chartData.paymentStatusDistribution,
      revenueByMonth: chartData.revenueByMonth,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchStats();
  };

  // Check if current user is admin
  if (currentAdmin?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only admins can view platform statistics.
          </p>
          <Link
            to="/"
            className="bg-[#DF603A] text-white px-6 py-3 rounded-xl hover:bg-[#c95232] transition inline-block"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const isLoading = adminLoading || statsLoading || usersLoading || ordersLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#DF603A] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Loading Platform Statistics</h2>
          <p className="text-gray-600">Fetching real-time platform data...</p>
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
                Platform Statistics
              </h1>
              <p className="text-gray-600">Real-time dashboard with comprehensive platform analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
              >
                <TrendingUp className="w-4 h-4" />
                Refresh Data
              </button>
              <div className="px-4 py-2 bg-gradient-to-r from-[#DF603A] to-orange-500 text-white rounded-full font-semibold">
                Live Dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-800 mt-2">{platformStats.totalUsers}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-1 text-sm ${parseFloat(growthMetrics.userGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(growthMetrics.userGrowth) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {growthMetrics.userGrowth}%
                  </div>
                  <span className="text-xs text-gray-500">
                    ({growthMetrics.newUsers30Days} new)
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Revenue - FROM DELIVERED ORDERS */}
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-800 mt-2">
                  ${platformStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-1 text-sm ${parseFloat(growthMetrics.revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(growthMetrics.revenueGrowth) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {growthMetrics.revenueGrowth}%
                  </div>
                  <span className="text-xs text-gray-500">
                    (${growthMetrics.newRevenue30Days.toFixed(2)} from {platformStats.deliveredOrders} delivered orders)
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-purple-800 mt-2">{platformStats.totalOrders}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-1 text-sm ${parseFloat(growthMetrics.orderGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(growthMetrics.orderGrowth) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {growthMetrics.orderGrowth}%
                  </div>
                  <span className="text-xs text-gray-500">
                    ({growthMetrics.newOrders30Days} new)
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Active Chefs */}
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Chefs</p>
                <p className="text-3xl font-bold text-orange-800 mt-2">{platformStats.activeChefs}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-1 text-sm ${parseFloat(growthMetrics.chefGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(growthMetrics.chefGrowth) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {growthMetrics.chefGrowth}%
                  </div>
                  <span className="text-xs text-gray-500">
                    ({growthMetrics.newChefs30Days} new)
                  </span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <ChefHat className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Distribution Chart */}
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold text-[#2D1B12] mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              User Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData.userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const total = chartData.userDistribution.reduce((sum, item) => sum + item.value, 0);
                      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                      return [`${value} (${percent}%)`, props.payload.name];
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold text-[#2D1B12] mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              Order Status Distribution
            </h3>
            <div className="space-y-4">
              {chartData.orderStatusDistribution.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm text-gray-700">{status.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{status.count}</span>
                    <span className="text-xs text-gray-500">
                      {platformStats.totalOrders > 0 
                        ? ((status.count / platformStats.totalOrders) * 100).toFixed(1)
                        : '0'}%
                    </span>
                  </div>
                </div>
              ))}
              {/* Total Orders Summary */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Total Orders</span>
                  <span className="font-bold text-[#DF603A]">{platformStats.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Order Completion Rate</span>
                  <span className="font-semibold text-green-600">
                    {platformStats.orderCompletionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Revenue from Delivered Orders</span>
                  <span className="font-semibold text-green-600">
                    ${platformStats.totalRevenue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Financial Metrics */}
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold text-[#2D1B12] mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Financial Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Average Order Value</span>
                <span className="font-semibold text-blue-800">
                  ${platformStats.averageOrderValue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Payment Success Rate</span>
                <span className="font-semibold text-green-600">
                  {platformStats.paymentSuccessRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Paid Orders</span>
                <span className="font-semibold">{platformStats.paidOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Pending Payments</span>
                <span className="font-semibold text-yellow-600">{platformStats.pendingPayments}</span>
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold text-[#2D1B12] mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              User Activity
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Active Users</span>
                <span className="font-semibold text-green-800">{platformStats.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Total Chefs</span>
                <span className="font-semibold">{platformStats.totalChefs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Total Admins</span>
                <span className="font-semibold">{platformStats.totalAdmins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Fraud Accounts</span>
                <span className="font-semibold text-red-600">{platformStats.fraudUsers}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold text-[#2D1B12] mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full flex items-center gap-2 justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                <Download className="w-4 h-4" />
                Export Data (JSON)
              </button>
              <Link 
                to="/admin-dashboard/manage-users" 
                className="w-full flex items-center gap-2 justify-center px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition"
              >
                <Users className="w-4 h-4" />
                Manage Users ({platformStats.totalUsers})
              </Link>
              <Link 
                to="/admin-dashboard/order-requests" 
                className="w-full flex items-center gap-2 justify-center px-4 py-3 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition"
              >
                <Package className="w-4 h-4" />
                View Orders ({platformStats.totalOrders})
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Revenue Chart */}
        {chartData.revenueByMonth.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-[#2D1B12] mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Revenue Trend (Last 6 Months)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    name="Revenue" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Platform Health Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-gray-600">Orders Delivered</p>
              </div>
              <p className="text-2xl font-bold text-green-800">
                {platformStats.deliveredOrders}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Generated ${platformStats.totalRevenue.toFixed(2)} in revenue
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-gray-600">Orders Pending</p>
              </div>
              <p className="text-2xl font-bold text-yellow-800">
                {platformStats.pendingOrders}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Awaiting chef confirmation
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-gray-600">Orders Cancelled</p>
              </div>
              <p className="text-2xl font-bold text-red-800">
                {platformStats.cancelledOrders}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {platformStats.totalOrders > 0 ? ((platformStats.cancelledOrders / platformStats.totalOrders) * 100).toFixed(1) : 0}% cancellation rate
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-gray-600">Avg. Order Value</p>
              </div>
              <p className="text-2xl font-bold text-purple-800">
                ${platformStats.averageOrderValue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Per delivered order
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformStatistics;