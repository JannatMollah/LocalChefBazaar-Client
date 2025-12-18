import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChefHat,
  Camera,
  DollarSign,
  Clock,
  Award,
  Utensils,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import axiosSecure from "../../../api/axiosSecure";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Form schema for creating meal
const createMealSchema = z.object({
  foodName: z.string().min(3, "Food name must be at least 3 characters"),
  foodImage: z.string().url("Please enter a valid image URL").optional().or(z.literal('')),
  price: z.number().min(1, "Price must be at least 1"),
  ingredients: z.string().min(10, "Please list at least 3 ingredients"),
  estimatedDeliveryTime: z.string().min(2, "Please enter estimated delivery time"),
  category: z.string().min(2, "Please select a category"),
  description: z.string().min(20, "Please provide a description"),
  prepTime: z.string().min(1, "Please enter preparation time"),
});

const CreateMeal = () => {
  const { user: firebaseUser } = useAuth();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState("");

  // Fetch chef data
  const { data: chef, isLoading: chefLoading } = useQuery({
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(createMealSchema),
    defaultValues: {
      foodName: "",
      foodImage: "",
      price: 0,
      ingredients: "",
      estimatedDeliveryTime: "30-45 minutes",
      category: "",
      description: "",
      prepTime: "30 minutes",
    },
  });

  const foodImage = watch("foodImage");

  // Update image preview when image URL changes
  useState(() => {
    if (foodImage) {
      setImagePreview(foodImage);
    }
  }, [foodImage]);

  // Create meal mutation
  const createMealMutation = useMutation({
    mutationFn: async (data) => {
      const mealData = {
        ...data,
        chefName: chef?.name || firebaseUser?.displayName,
        chefId: chef?.chefId,
        userEmail: firebaseUser.email,
        chefExperience: chef?.experience || "Not specified",
        rating: 0,
        createdAt: new Date().toISOString(),
      };
      
      const response = await axiosSecure.post("/meals", mealData);
      return response.data;
    },
    onSuccess: (data) => {
      Swal.fire({
        title: "Meal Created!",
        text: "Your meal has been created successfully",
        icon: "success",
        confirmButtonColor: "#DF603A",
        timer: 3000,
        showConfirmButton: false,
      });
      
      reset();
      setImagePreview("");
      queryClient.invalidateQueries(["chefMeals", chef?.chefId]);
      queryClient.invalidateQueries(["chefStats", chef?.chefId]);
    },
    onError: (error) => {
      console.error("Create meal error:", error);
      Swal.fire({
        title: "Failed to Create Meal",
        text: error.response?.data?.message || "Please check your data and try again",
        icon: "error",
        confirmButtonColor: "#DF603A",
      });
    },
  });

  const onSubmit = async (data) => {
    createMealMutation.mutate(data);
  };

  const categories = [
    "Bangladeshi", "Indian", "Chinese", "Thai", 
    "Italian", "Mexican", "American", "Japanese",
    "Korean", "Middle Eastern", "Vegetarian", "Vegan",
    "Desserts", "Breakfast", "Lunch", "Dinner"
  ];

  // Check if user is a chef
  if (chefLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#DF603A] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading chef information...</p>
        </div>
      </div>
    );
  }

  if (chef?.role !== "chef") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Not Authorized</h2>
          <p className="text-gray-600 mb-6">
            You need to be a chef to create meals.
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

  if (chef?.status === "fraud") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Account Restricted</h2>
          <p className="text-gray-600 mb-6">
            Your chef account has been restricted. You cannot create meals.
          </p>
          <button
            onClick={() => window.location.href = "/contact"}
            className="bg-[#DF603A] text-white px-6 py-3 rounded-xl"
          >
            Contact Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="playfair-font text-4xl font-bold text-[#2D1B12] mb-2">
            Create New Meal
          </h1>
          <p className="text-gray-600">Add a new meal to your menu and start earning</p>
          <div className="flex items-center gap-3 mt-4">
            <div className="px-4 py-2 bg-gradient-to-r from-[#DF603A] to-orange-500 text-white rounded-full font-semibold flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              <span>Chef: {chef?.name}</span>
            </div>
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium text-sm">
              ID: {chef?.chefId}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-[#DF603A]/10 to-orange-500/10 p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow">
                <Utensils className="w-6 h-6 text-[#DF603A]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2D1B12]">Meal Details</h2>
                <p className="text-gray-600">Fill in the details of your new meal</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Food Name & Category */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Name *
                  </label>
                  <input
                    {...register("foodName")}
                    type="text"
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                    placeholder="e.g., Chicken Biriyani, Beef Burger"
                  />
                  {errors.foodName && (
                    <p className="text-red-500 text-sm mt-1">{errors.foodName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register("category")}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>
              </div>

              {/* Food Image URL */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Food Image URL *
                </label>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <input
                      {...register("foodImage")}
                      type="url"
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      placeholder="https://example.com/food-image.jpg"
                      onChange={(e) => setImagePreview(e.target.value)}
                    />
                    {errors.foodImage && (
                      <p className="text-red-500 text-sm mt-1">{errors.foodImage.message}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Enter a direct image URL. You can use services like Imgur or Google Photos.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <div class="text-center p-4">
                                <Upload class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p class="text-sm text-gray-500">Invalid image URL</p>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Image preview will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Prep Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price (BDT) *
                  </label>
                  <input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    step="0.01"
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                    placeholder="Enter price"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Preparation Time *
                  </label>
                  <select
                    {...register("prepTime")}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                  >
                    <option value="">Select Time</option>
                    <option value="15 minutes">15 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="1.5 hours">1.5 hours</option>
                    <option value="2 hours">2 hours</option>
                  </select>
                  {errors.prepTime && (
                    <p className="text-red500 text-sm mt-1">{errors.prepTime.message}</p>
                  )}
                </div>
              </div>

              {/* Estimated Delivery Time */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Estimated Delivery Time *
                </label>
                <select
                  {...register("estimatedDeliveryTime")}
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                >
                  <option value="">Select Delivery Time</option>
                  <option value="15-30 minutes">15-30 minutes</option>
                  <option value="30-45 minutes">30-45 minutes</option>
                  <option value="45-60 minutes">45-60 minutes</option>
                  <option value="1-1.5 hours">1-1.5 hours</option>
                  <option value="1.5-2 hours">1.5-2 hours</option>
                  <option value="2+ hours">2+ hours</option>
                </select>
                {errors.estimatedDeliveryTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.estimatedDeliveryTime.message}</p>
                )}
              </div>

              {/* Ingredients */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Ingredients *
                </label>
                <textarea
                  {...register("ingredients")}
                  rows="3"
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                  placeholder="List all ingredients separated by commas. e.g., Chicken, Rice, Spices, Oil, Onion, Garlic"
                />
                {errors.ingredients && (
                  <p className="text-red-500 text-sm mt-1">{errors.ingredients.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Separate ingredients with commas. Be specific about quantities if needed.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Description *
                </label>
                <textarea
                  {...register("description")}
                  rows="4"
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                  placeholder="Describe your meal, cooking process, special features, serving suggestions, etc."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <button
                  type="submit"
                  disabled={createMealMutation.isLoading}
                  className="w-full bg-gradient-to-r from-[#DF603A] to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {createMealMutation.isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Creating Meal...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Create & Publish Meal
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Guidelines for Creating Meals
          </h3>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <span>Use high-quality, appetizing images of your actual food</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <span>Be accurate with ingredients to avoid allergy issues</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <span>Set realistic delivery times based on your preparation capacity</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <span>Price competitively while covering your costs</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateMeal;