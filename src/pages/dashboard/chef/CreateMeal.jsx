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
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
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
  estimatedDeliveryTime: z.string().min(2, "Please enter estimated delivery time"),
  category: z.string().min(2, "Please select a category"),
  description: z.string().min(20, "Please provide a description"),
  prepTime: z.string().min(1, "Please enter preparation time"),
});

const CreateMeal = () => {
  const { user: firebaseUser } = useAuth();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [newIngredient, setNewIngredient] = useState("");

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
  } = useForm({
    resolver: zodResolver(createMealSchema),
    defaultValues: {
      foodName: "",
      foodImage: "",
      price: 0,
      estimatedDeliveryTime: "30-45 minutes",
      category: "",
      description: "",
      prepTime: "30 minutes",
    },
  });

  const foodImage = watch("foodImage");

  // Add new ingredient
  const handleAddIngredient = () => {
    if (newIngredient.trim() === "") return;
    
    setIngredients([...ingredients, newIngredient.trim()]);
    setNewIngredient("");
  };

  // Remove ingredient
  const handleRemoveIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  // Update ingredient
  const handleUpdateIngredient = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  // Add ingredient on Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  // Create meal mutation
  const createMealMutation = useMutation({
    mutationFn: async (data) => {
      // Filter out empty ingredients and create array
      const filteredIngredients = ingredients
        .filter(ing => ing.trim() !== "")
        .map(ing => ing.trim());
      
      const mealData = {
        ...data,
        ingredients: filteredIngredients, // Send as array
        chefName: chef?.name || firebaseUser?.displayName,
        chefId: chef?.chefId,
        userEmail: firebaseUser.email,
        chefExperience: chef?.experience || "Not specified",
        rating: 5,
        isAvailable: true,
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
      setIngredients([""]);
      setNewIngredient("");
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
    // Validate that at least one ingredient is provided
    const filteredIngredients = ingredients.filter(ing => ing.trim() !== "");
    if (filteredIngredients.length === 0) {
      Swal.fire({
        title: "Missing Ingredients",
        text: "Please add at least one ingredient",
        icon: "warning",
        confirmButtonColor: "#DF603A",
      });
      return;
    }
    
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
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-700 mb-2">Image Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-48 h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center border">
                              <p class="text-gray-500 text-sm">Invalid image URL</p>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  )}
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
                    <option value="2+ hours">2+ hours</option>
                  </select>
                  {errors.prepTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.prepTime.message}</p>
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

              {/* Ingredients (Array Format) */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Ingredients *
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    ({ingredients.filter(ing => ing.trim() !== "").length} added)
                  </span>
                </label>
                
                <div className="space-y-3">
                  {/* Existing Ingredients */}
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ingredient}
                        onChange={(e) => handleUpdateIngredient(index, e.target.value)}
                        className="flex-1 border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                        placeholder={`Ingredient ${index + 1} (e.g., Rice, Chicken, Spices)`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={ingredients.length <= 1}
                        title="Remove ingredient"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add New Ingredient */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      placeholder="Type ingredient and press Enter or click +"
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition disabled:opacity-50"
                      disabled={newIngredient.trim() === ""}
                      title="Add ingredient"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  Add one ingredient at a time. Press Enter or click + to add. Ingredients will be saved as an array.
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
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <span><strong>Ingredients:</strong> Add each ingredient separately, they will be saved as an array in database</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateMeal;