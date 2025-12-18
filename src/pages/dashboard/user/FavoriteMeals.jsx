import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  ShoppingBag,
  X,
  ChefHat,
  DollarSign,
  Flame,
  AlertCircle,
  Bell,
} from "lucide-react";
import axiosSecure from "../../../api/axiosSecure";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";

const FavoriteMeals = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch favorite meals
  const { data: favorites = [], isLoading, error: fetchError } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get("/favorites");
        return response.data;
      } catch (error) {
        console.error("Error fetching favorites:", error);
        throw error;
      }
    },
  });

  // Remove from favorites mutation
  const removeMutation = useMutation({
    mutationFn: async (mealId) => {
      // First, find the favorite ID
      const favorite = favorites.find(f => f.mealId === mealId);
      if (!favorite) throw new Error("Favorite not found");
      
      await axiosSecure.delete(`/favorites/${favorite._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["favorites"]);
      Swal.fire("Removed!", "Meal removed from favorites.", "success");
    },
    onError: (error) => {
      Swal.fire("Error!", error.response?.data?.message || "Failed to remove from favorites", "error");
    },
  });

  const filteredFavorites = favorites.filter((fav) => {
    // Filter by category
    if (filter !== "all" && fav.category !== filter) return false;
    
    // Search by meal name or chef name
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        fav.mealName?.toLowerCase().includes(searchLower) ||
        fav.chefName?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleRemoveFavorite = (mealId) => {
    Swal.fire({
      title: "Remove from Favorites?",
      text: "Are you sure you want to remove this meal from your favorites?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, remove it",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        removeMutation.mutate(mealId);
      }
    });
  };

  const handleOrderNow = (meal) => {
    navigate(`/meals/${meal.mealId}`);
  };

  // Get unique categories from favorites
  const categories = ["all", ...new Set(favorites.map(fav => fav.category).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#DF603A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorite meals...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Favorites
          </h2>
          <p className="text-gray-600 mb-6">
            Failed to load your favorite meals. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#DF603A] text-white px-6 py-3 rounded-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFAF8] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="playfair-font text-4xl font-bold text-[#2D1B12] mb-2">
            Favorite Meals
          </h1>
          <p className="text-gray-600">Your saved meals for quick ordering</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Favorites</p>
                <p className="text-2xl font-bold text-[#2D1B12]">{favorites.length}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-[#2D1B12]">
                  {categories.length - 1}
                </p>
              </div>
              <Filter className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-[#2D1B12]">
                  ৳{favorites.reduce((sum, f) => sum + f.price, 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-4 mb-6 border shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Favorites List */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {favorites.length === 0 ? "No favorites yet" : "No matching favorites"}
            </h3>
            <p className="text-gray-600 mb-6">
              {favorites.length === 0 
                ? "Start adding your favorite meals for quick access! Click the heart icon on any meal." 
                : "Try a different search or filter."}
            </p>
            <Link
              to="/meals"
              className="inline-block bg-[#DF603A] text-white px-6 py-3 rounded-xl hover:bg-[#c95232] transition"
            >
              Browse Meals
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((meal) => (
              <div key={meal._id} className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition group">
                {/* Meal Header */}
                <div className="p-5 border-b">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-[#2D1B12] line-clamp-1 group-hover:text-[#DF603A] transition">
                        {meal.mealName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <ChefHat className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{meal.chefName}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(meal.mealId)}
                      disabled={removeMutation.isLoading}
                      className="p-2 rounded-full hover:bg-red-50 transition"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </button>
                  </div>
                </div>
                
                {/* Meal Details */}
                <div className="p-5">
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-[#DF603A]">
                        ৳{meal.price}
                      </p>
                      <p className="text-sm text-gray-600">per serving</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">4.5</span>
                    </div>
                  </div>
                  
                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-600">Prep Time</p>
                        <p className="font-medium text-sm">30-45 min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-600">Location</p>
                        <p className="font-medium text-sm truncate">Dhaka</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Tags */}
                  {meal.category && (
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {meal.category}
                      </span>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex">
                    <button
                      onClick={() => handleOrderNow(meal)}
                      className="flex-1 bg-[#DF603A] text-white py-2 rounded-xl font-medium hover:bg-[#c95232] transition flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Order Now
                    </button>
                  </div>
                </div>
                
                {/* Added Info */}
                <div className="px-5 pb-5">
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Added on {new Date(meal.addedTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Benefits Section */}
        {favorites.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6 border">
            <h3 className="text-lg font-semibold text-[#2D1B12] mb-4">
              Why Save Favorites?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Quick Ordering</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Re-order your favorite meals in just a few clicks without searching.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Notifications</h4>
                </div>
                <p className="text-sm text-green-700">
                  Get notified when your favorite chefs add new items or special offers.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-purple-800">Personalized</h4>
                </div>
                <p className="text-sm text-purple-700">
                  We recommend similar meals based on your favorites.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteMeals;