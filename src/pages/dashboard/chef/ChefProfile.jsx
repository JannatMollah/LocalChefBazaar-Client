import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Shield,
  ChefHat,
  Star,
  Award,
  Clock,
  Package,
  TrendingUp,
  Loader2,
  CheckCircle,
  BadgeCheck,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import axiosSecure from "../../../api/axiosSecure";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Form schema for chef profile
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  photoURL: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  experience: z.string().min(5, "Please describe your experience"),
  specialization: z.string().min(3, "Please enter your specialization"),
});

const ChefProfile = () => {
  const { user: firebaseUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch chef data from MongoDB
  const { 
    data: chef, 
    isLoading: chefLoading, 
    error: chefError,
    refetch: refetchChef 
  } = useQuery({
    queryKey: ["chefData", firebaseUser?.email],
    queryFn: async () => {
      if (!firebaseUser?.email) return null;
      
      try {
        const response = await axiosSecure.get(`/users/${firebaseUser.email}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching chef data:", error);
        throw error;
      }
    },
    enabled: !!firebaseUser?.email,
    refetchOnWindowFocus: false,
  });

  // Fetch chef statistics
  const { data: chefStats, isLoading: statsLoading } = useQuery({
    queryKey: ["chefStats", chef?.chefId],
    queryFn: async () => {
      try {
        const [ordersRes, mealsRes, reviewsRes] = await Promise.all([
          axiosSecure.get(`/orders/chef/${chef?.chefId}`),
          axiosSecure.get(`/meals/chef/${chef?.chefId}`),
          axiosSecure.get("/reviews/chef")
        ]);
        
        const orders = ordersRes.data || [];
        const meals = mealsRes.data || [];
        const reviews = reviewsRes.data || [];
        
        const totalOrders = orders.length;
        const totalMeals = meals.length;
        const pendingOrders = orders.filter(o => o.orderStatus === "pending").length;
        const totalEarnings = orders
          .filter(o => o.paymentStatus === "paid")
          .reduce((sum, o) => sum + (o.price * o.quantity), 0);
        
        return { 
          totalOrders, 
          totalMeals, 
          pendingOrders, 
          totalEarnings,
          reviews: reviews.length,
          rating: reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : "0.0"
        };
      } catch (error) {
        console.error("Error fetching chef stats:", error);
        return { 
          totalOrders: 0, 
          totalMeals: 0, 
          pendingOrders: 0, 
          totalEarnings: 0,
          reviews: 0,
          rating: "0.0"
        };
      }
    },
    enabled: !!chef?.chefId
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const photoURL = watch("photoURL");

  // Initialize form with chef data
  useEffect(() => {
    if (chef) {
      setValue("name", chef.name || firebaseUser?.displayName || "");
      setValue("address", chef.address || "");
      setValue("photoURL", chef.photoURL || firebaseUser?.photoURL || "");
      setValue("experience", chef.experience || "Not specified");
      setValue("specialization", chef.specialization || "Not specified");
    }
  }, [chef, firebaseUser, setValue]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axiosSecure.put(`/users/${firebaseUser.email}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      Swal.fire({
        title: "Success!",
        text: "Profile updated successfully",
        icon: "success",
        confirmButtonColor: "#DF603A",
        timer: 2000,
        showConfirmButton: false,
      });
      
      refetchChef();
      queryClient.invalidateQueries(["chefData", firebaseUser.email]);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      Swal.fire({
        title: "Update Failed!",
        text: error.response?.data?.message || "Failed to update profile",
        icon: "error",
        confirmButtonColor: "#DF603A",
      });
    },
  });

  const onSubmit = async (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    if (chef) {
      reset({
        name: chef.name || firebaseUser?.displayName || "",
        address: chef.address || "",
        photoURL: chef.photoURL || firebaseUser?.photoURL || "",
        experience: chef.experience || "Not specified",
        specialization: chef.specialization || "Not specified",
      });
    }
    setIsEditing(false);
  };

  // Loading state
  if (chefLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#DF603A] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Loading Chef Profile</h2>
          <p className="text-gray-600">Fetching your chef information...</p>
        </div>
      </div>
    );
  }

  // Check if user is a chef
  if (chef?.role !== "chef") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Not a Chef</h2>
          <p className="text-gray-600 mb-6">
            You need to be a chef to access this page. Please request chef role from your profile.
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

  // Check if chef is fraud
  if (chef?.status === "fraud") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Account Restricted</h2>
          <p className="text-gray-600 mb-6">
            Your chef account has been restricted. Please contact admin.
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
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="playfair-font text-4xl font-bold text-[#2D1B12] mb-2">
                Chef Profile
              </h1>
              <p className="text-gray-600">Manage your chef account and information</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-[#DF603A] to-orange-500 text-white rounded-full font-semibold flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                <span>Chef ID: {chef?.chefId || "N/A"}</span>
              </div>
              {chef?.status === "active" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  <BadgeCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Verified Chef</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Chef Stats & Info */}
          <div className="space-y-6">
            {/* Chef Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <div className="text-center mb-6">
                <div className="relative mx-auto w-32 h-32 mb-4">
                  {photoURL || chef?.photoURL ? (
                    <img
                      src={photoURL || chef?.photoURL}
                      alt={chef?.name}
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full rounded-full bg-gradient-to-br from-[#DF603A] to-orange-500 flex items-center justify-center border-4 border-white shadow-xl">
                            <ChefHat class="w-16 h-16 text-white" />
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#DF603A] to-orange-500 flex items-center justify-center border-4 border-white shadow-xl">
                      <ChefHat className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border">
                    <ChefHat className="w-6 h-6 text-[#DF603A]" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-[#2D1B12]">
                  {chef?.name || "Chef"}
                </h2>
                <p className="text-gray-600 mt-1">{chef?.email}</p>
                
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {chef?.specialization || "General Chef"}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {chef?.experience?.split(' ')[0] || "0"} years
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Award className="w-5 h-5 text-[#DF603A]" />
                  <div>
                    <p className="font-medium text-gray-800">Experience</p>
                    <p className="text-sm text-gray-600">{chef?.experience || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-[#DF603A]" />
                  <div>
                    <p className="font-medium text-gray-800">Member Since</p>
                    <p className="text-sm text-gray-600">
                      {chef?.createdAt 
                        ? new Date(chef.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chef Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <h3 className="text-lg font-semibold text-[#2D1B12] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#DF603A]" />
                Chef Statistics
              </h3>
              {statsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <p className="text-sm text-gray-600">Total Orders</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-800">{chefStats?.totalOrders || 0}</p>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">৳</span>
                        <p className="text-sm text-gray-600">Earnings</p>
                      </div>
                      <p className="text-2xl font-bold text-green-800">৳{chefStats?.totalEarnings || 0}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm text-gray-600">Pending</p>
                      </div>
                      <p className="text-2xl font-bold text-yellow-800">{chefStats?.pendingOrders || 0}</p>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
                        <p className="text-sm text-gray-600">Rating</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-800">{chefStats?.rating || "0.0"}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <ChefHat className="w-4 h-4 text-orange-600" />
                        <p className="text-sm text-gray-600">Total Meals</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-800">{chefStats?.totalMeals || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D1B12]">
                  Edit Chef Profile
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-[#DF603A] text-white px-4 py-2 rounded-xl hover:bg-[#c95232] transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Chef Name
                  </label>
                  {isEditing ? (
                    <input
                      {...register("name")}
                      type="text"
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="border rounded-xl p-3 bg-gray-50">
                      <p className="text-gray-800">{chef?.name || "Not set"}</p>
                    </div>
                  )}
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <div className="border rounded-xl p-3 bg-gray-50">
                    <p className="text-gray-800">{chef?.email}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Photo URL Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile Photo URL
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        {...register("photoURL")}
                        type="url"
                        className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                        placeholder="https://example.com/your-photo.jpg"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter a direct image URL for your profile picture
                      </p>
                    </>
                  ) : (
                    <div className="border rounded-xl p-3 bg-gray-50">
                      <p className="text-gray-800 break-all">
                        {chef?.photoURL || "No profile photo set"}
                      </p>
                    </div>
                  )}
                  {errors.photoURL && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.photoURL.message}
                    </p>
                  )}
                </div>

                {/* Specialization Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Specialization
                  </label>
                  {isEditing ? (
                    <input
                      {...register("specialization")}
                      type="text"
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      placeholder="e.g., Italian Cuisine, Baking, BBQ, etc."
                    />
                  ) : (
                    <div className="border rounded-xl p-3 bg-gray-50">
                      <p className="text-gray-800">
                        {chef?.specialization || "Not specified"}
                      </p>
                    </div>
                  )}
                  {errors.specialization && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.specialization.message}
                    </p>
                  )}
                </div>

                {/* Experience Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <ChefHat className="w-4 h-4" />
                    Experience
                  </label>
                  {isEditing ? (
                    <textarea
                      {...register("experience")}
                      rows="3"
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      placeholder="Describe your culinary experience, years of experience, specialties, etc."
                    />
                  ) : (
                    <div className="border rounded-xl p-3 bg-gray-50">
                      <p className="text-gray-800">
                        {chef?.experience || "Not specified"}
                      </p>
                    </div>
                  )}
                  {errors.experience && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.experience.message}
                    </p>
                  )}
                </div>

                {/* Address Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </label>
                  {isEditing ? (
                    <textarea
                      {...register("address")}
                      rows="3"
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      placeholder="Enter your complete delivery address"
                    />
                  ) : (
                    <div className="border rounded-xl p-3 bg-gray-50">
                      <p className="text-gray-800">
                        {chef?.address || "Not provided"}
                      </p>
                    </div>
                  )}
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* Save Button */}
                {isEditing && (
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="w-full bg-gradient-to-r from-[#DF603A] to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updateProfileMutation.isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefProfile;