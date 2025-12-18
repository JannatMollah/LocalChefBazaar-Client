import { useState } from "react";
import {
  ChefHat,
  Package,
  DollarSign,
  Star,
  Clock,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Plus,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import axiosSecure from "../../../api/axiosSecure";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

const ChefMeals = () => {
  const { user: firebaseUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
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

  // Fetch chef meals
  const { 
    data: meals = [], 
    isLoading: mealsLoading, 
    error: mealsError 
  } = useQuery({
    queryKey: ["chefMeals", chef?.chefId],
    queryFn: async () => {
      if (!chef?.chefId) return [];
      
      try {
        const response = await axiosSecure.get(`/meals/chef/${chef.chefId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching chef meals:", error);
        return [];
      }
    },
    enabled: !!chef?.chefId,
  });

  // Delete meal mutation
  const deleteMealMutation = useMutation({
    mutationFn: async (mealId) => {
      await axiosSecure.delete(`/meals/${mealId}`);
    },
    onSuccess: () => {
      Swal.fire({
        title: "Meal Deleted!",
        text: "Meal has been deleted successfully",
        icon: "success",
        confirmButtonColor: "#DF603A",
        timer: 2000,
        showConfirmButton: false,
      });
      queryClient.invalidateQueries(["chefMeals", chef?.chefId]);
      queryClient.invalidateQueries(["chefStats", chef?.chefId]);
    },
    onError: (error) => {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to delete meal",
        icon: "error",
        confirmButtonColor: "#DF603A",
      });
    },
  });

  // Update meal status mutation
  const updateMealStatusMutation = useMutation({
    mutationFn: async ({ mealId, isAvailable }) => {
      await axiosSecure.patch(`/meals/${mealId}`, { isAvailable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["chefMeals", chef?.chefId]);
    },
    onError: (error) => {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update meal status",
        icon: "error",
        confirmButtonColor: "#DF603A",
      });
    },
  });

  const handleDeleteMeal = (mealId, mealName) => {
    Swal.fire({
      title: "Delete Meal?",
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-2">Are you sure you want to delete:</p>
          <p class="font-semibold text-[#DF603A]">${mealName}</p>
          <p class="text-sm text-gray-600 mt-2">This action cannot be undone.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMealMutation.mutate(mealId);
      }
    });
  };

  const handleToggleAvailability = (mealId, isAvailable, mealName) => {
    const newStatus = !isAvailable;
    const action = newStatus ? "available" : "unavailable";
    
    Swal.fire({
      title: `Make ${action}?`,
      text: `This meal will be ${action} for customers.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, make ${action}`,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        updateMealStatusMutation.mutate({ mealId, isAvailable: newStatus });
      }
    });
  };

  const filteredMeals = meals.filter((meal) => {
    // Filter by status
    if (filter === "available" && !meal.isAvailable) return false;
    if (filter === "unavailable" && meal.isAvailable !== false) return false;
    
    // Search by name
    if (searchTerm && !meal.foodName?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Check if user is a chef
  if (chef?.role !== "chef") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Not Authorized</h2>
          <p className="text-gray-600 mb-6">
            You need to be a chef to view your meals.
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

  if (mealsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#DF603A] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Loading Meals</h2>
          <p className="text-gray-600">Fetching your meal list...</p>
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
                My Meals
              </h1>
              <p className="text-gray-600">Manage your menu and meal offerings</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/chef-dashboard/create-meal"
                className="flex items-center gap-2 bg-gradient-to-r from-[#DF603A] to-orange-500 text-white px-5 py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                <Plus className="w-5 h-5" />
                Add New Meal
              </Link>
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
                Total: {meals.length}
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Meals</p>
                <p className="text-2xl font-bold text-green-800">
                  {meals.filter(m => m.isAvailable !== false).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unavailable</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {meals.filter(m => m.isAvailable === false).length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Price Range</p>
                <p className="text-2xl font-bold text-blue-800">
                  ৳{meals.length > 0 ? Math.min(...meals.map(m => m.price)) : 0} - 
                  ৳{meals.length > 0 ? Math.max(...meals.map(m => m.price)) : 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-800">
                  {meals.length > 0 
                    ? (meals.reduce((sum, m) => sum + (m.rating || 0), 0) / meals.length).toFixed(1)
                    : "0.0"}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-500 fill-purple-500" />
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
                  <option value="all">All Meals</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search meals by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Meals List */}
        {filteredMeals.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {meals.length === 0 ? "No meals created" : "No matching meals"}
            </h3>
            <p className="text-gray-600 mb-6">
              {meals.length === 0 
                ? "You haven't created any meals yet. Start by adding your first meal!" 
                : "Try a different search or filter."}
            </p>
            <Link
              to="/dashboard/chef/create-meal"
              className="inline-flex items-center gap-2 bg-[#DF603A] text-white px-6 py-3 rounded-xl hover:bg-[#c95232] transition"
            >
              <Plus className="w-5 h-5" />
              Create Your First Meal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeals.map((meal) => (
              <div 
                key={meal._id} 
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition ${
                  meal.isAvailable === false ? 'opacity-75' : ''
                }`}
              >
                {/* Meal Image & Status */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={meal.foodImage}
                    alt={meal.foodName}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                  {meal.isAvailable === false && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Unavailable
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-[#DF603A]">
                    ৳{meal.price}
                  </div>
                </div>
                
                {/* Meal Details */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-[#2D1B12] line-clamp-1">
                        {meal.foodName}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {meal.rating || "0.0"} • {meal.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{meal.prepTime || "30 min"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-gray-500" />
                      {/* <span className="text-gray-600">
                        {meal.ingredients?.split(',').length || 0} items
                      </span> */}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {meal.description || "No description available"}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleToggleAvailability(meal._id, meal.isAvailable, meal.foodName)}
                      className={`flex-1 py-2 rounded-xl font-medium text-sm transition ${
                        meal.isAvailable === false
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {meal.isAvailable === false ? 'Make Available' : 'Make Unavailable'}
                    </button>
                    
                    {/* <button
                      onClick={() => navigate(`/update-meal/${meal._id}`)}
                      className="flex items-center justify-center w-12 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition"
                      title="Edit Meal"
                    >
                      <Edit className="w-4 h-4" />
                    </button> */}
                    
                    <button
                      onClick={() => handleDeleteMeal(meal._id, meal.foodName)}
                      className="flex items-center justify-center w-12 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition"
                      title="Delete Meal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Managing Your Meals</h3>
              <ul className="space-y-2 text-green-700 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <span>Keep your meal information updated for better customer experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <span>Mark meals as unavailable when ingredients are not available</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <span>Regularly update prices based on ingredient costs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefMeals;