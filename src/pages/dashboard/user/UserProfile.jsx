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
  Camera,
  AlertCircle,
  ChefHat,
  ShieldCheck,
  Clock,
  Send,
  Package,
  TrendingUp,
  Loader2,
  CheckCircle,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import axiosSecure from "../../../api/axiosSecure";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Form schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  photoURL: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
});

const UserProfile = () => {
  const { user: firebaseUser } = useAuth(); // Firebase user
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user data from MongoDB
  const { 
    data: user, 
    isLoading: userLoading, 
    error: userError,
    refetch: refetchUser 
  } = useQuery({
    queryKey: ["userData", firebaseUser?.email],
    queryFn: async () => {
      if (!firebaseUser?.email) return null;
      
      try {
        const response = await axiosSecure.get(`/users/${firebaseUser.email}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
      }
    },
    enabled: !!firebaseUser?.email,
    refetchOnWindowFocus: false,
  });

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["userStats", firebaseUser?.email],
    queryFn: async () => {
      try {
        const [ordersRes, paymentsRes] = await Promise.all([
          axiosSecure.get("/orders/my"),
          axiosSecure.get("/payments/history")
        ]);
        
        const orders = ordersRes.data || [];
        const payments = paymentsRes.data || [];
        
        const totalOrders = orders.length;
        const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const pendingOrders = orders.filter(o => o.orderStatus === "pending").length;
        
        return { totalOrders, totalSpent, pendingOrders };
      } catch (error) {
        console.error("Error fetching user stats:", error);
        return { totalOrders: 0, totalSpent: 0, pendingOrders: 0 };
      }
    },
    enabled: !!firebaseUser?.email
  });

  // Fetch pending requests
  const { data: pendingRequests } = useQuery({
    queryKey: ["pendingRequests", firebaseUser?.email],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get("/requests");
        const allRequests = response.data || [];
        // Filter current user's pending requests
        return allRequests.filter(
          r => r.userEmail === firebaseUser.email && r.requestStatus === "pending"
        );
      } catch (error) {
        console.error("Error fetching requests:", error);
        return [];
      }
    },
    enabled: !!firebaseUser?.email
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

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setValue("name", user.name || firebaseUser?.displayName || "");
      setValue("address", user.address || "");
      setValue("photoURL", user.photoURL || firebaseUser?.photoURL || "");
    }
  }, [user, firebaseUser, setValue]);

  // Update profile mutation - Direct MongoDB update
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      // Try PATCH first
      try {
        const response = await axiosSecure.patch("/users/profile", data);
        return response.data;
      } catch (patchError) {
        console.log("PATCH failed, trying PUT...");
        // If PATCH fails, try direct update
        const updateData = {
          ...data,
          email: firebaseUser.email,
          updatedAt: new Date().toISOString()
        };
        
        const response = await axiosSecure.put(`/users/${firebaseUser.email}`, updateData);
        return response.data;
      }
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
      
      // Refresh user data
      refetchUser();
      queryClient.invalidateQueries(["userData", firebaseUser.email]);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Profile update error:", error.response?.data || error);
      Swal.fire({
        title: "Update Failed!",
        html: `
          <div class="text-left">
            <p class="text-gray-700 mb-2">Failed to update profile. Possible reasons:</p>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Database connection issue</li>
              <li>• Server error</li>
              <li>• Invalid data format</li>
            </ul>
            <p class="text-sm text-gray-600 mt-3">Please try again or contact support.</p>
          </div>
        `,
        icon: "error",
        confirmButtonColor: "#DF603A",
      });
    },
  });

  // Send role request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (requestType) => {
      const response = await axiosSecure.post("/requests", { 
        requestType,
        userName: user?.name || firebaseUser?.displayName 
      });
      return response.data;
    },
    onSuccess: () => {
      Swal.fire({
        title: "Request Sent!",
        text: "Your request has been submitted for admin approval.",
        icon: "success",
        confirmButtonColor: "#DF603A",
        timer: 2000,
        showConfirmButton: false,
      });
      queryClient.invalidateQueries(["pendingRequests", firebaseUser.email]);
    },
    onError: (error) => {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to send request",
        icon: "error",
        confirmButtonColor: "#DF603A",
      });
    },
  });

  const onSubmit = async (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    if (user) {
      reset({
        name: user.name || firebaseUser?.displayName || "",
        address: user.address || "",
        photoURL: user.photoURL || firebaseUser?.photoURL || "",
      });
    }
    setIsEditing(false);
  };

  const handleRoleRequest = (requestType) => {
    Swal.fire({
      title: `Become a ${requestType === "chef" ? "Chef" : "Admin"}?`,
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-700">
            ${requestType === "chef" 
              ? "As a chef, you can create and sell your own meals on the platform."
              : "As an admin, you can manage platform users and monitor activities."
            }
          </p>
          <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p class="text-sm text-yellow-700">
              ⚠️ This request will be sent to admin for approval.
            </p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Send Request",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        sendRequestMutation.mutate(requestType);
      }
    });
  };

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#DF603A] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Loading Profile</h2>
          <p className="text-gray-600">Fetching your information from database...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (userError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">
            Failed to load your profile data from database.
          </p>
          <button
            onClick={() => refetchUser()}
            className="bg-[#DF603A] text-white px-6 py-3 rounded-xl hover:bg-[#c95232] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Check if user exists
  if (!user && !firebaseUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">No User Found</h2>
          <p className="text-gray-600">Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  // Use firebase user as fallback
  const displayUser = user || {
    name: firebaseUser?.displayName || "User",
    email: firebaseUser?.email || "",
    role: "user",
    status: "active",
    address: "",
    photoURL: firebaseUser?.photoURL || "",
    createdAt: new Date().toISOString()
  };

  const hasPendingChefRequest = pendingRequests?.some(
    r => r.requestType === "chef"
  );
  const hasPendingAdminRequest = pendingRequests?.some(
    r => r.requestType === "admin"
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="playfair-font text-4xl font-bold text-[#2D1B12] mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Stats */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <div className="text-center mb-6">
                <div className="relative mx-auto w-32 h-32 mb-4">
                  {displayUser.photoURL ? (
                    <img
                      src={displayUser.photoURL}
                      alt={displayUser.name}
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full rounded-full bg-gradient-to-br from-[#DF603A] to-orange-400 flex items-center justify-center border-4 border-white shadow-lg">
                            <User class="w-16 h-16 text-white" />
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#DF603A] to-orange-400 flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-[#2D1B12]">
                  {displayUser.name}
                </h2>
                <p className="text-gray-600 mt-1">{displayUser.email}</p>
                
                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    displayUser.role === "admin" 
                      ? "bg-purple-100 text-purple-800"
                      : displayUser.role === "chef"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {displayUser.role?.toUpperCase() || "USER"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-800">Account Status</p>
                    <p className="text-sm text-green-700 capitalize">
                      {displayUser.status === "active" ? "Active" : displayUser.status || "Active"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-[#DF603A]" />
                  <div>
                    <p className="font-medium text-gray-800">Member Since</p>
                    <p className="text-sm text-gray-600">
                      {displayUser.createdAt 
                        ? new Date(displayUser.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <h3 className="text-lg font-semibold text-[#2D1B12] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#DF603A]" />
                Your Activity
              </h3>
              {statsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-xl font-bold text-blue-800">{userStats?.totalOrders || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">৳</span>
                      <div>
                        <p className="text-sm text-gray-600">Total Spent</p>
                        <p className="text-xl font-bold text-green-800">{userStats?.totalSpent || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Pending Orders</p>
                        <p className="text-xl font-bold text-yellow-800">{userStats?.pendingOrders || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Role Upgrade Section */}
            {displayUser.role === "user" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <h3 className="text-lg font-semibold text-[#2D1B12] mb-4">
                  Upgrade Account
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleRoleRequest("chef")}
                    disabled={hasPendingChefRequest || sendRequestMutation.isLoading}
                    className="w-full flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <ChefHat className="w-5 h-5 text-[#DF603A]" />
                      <div className="text-left">
                        <p className="font-medium text-gray-800">Become a Chef</p>
                        <p className="text-sm text-gray-600">Sell your own meals</p>
                      </div>
                    </div>
                    {hasPendingChefRequest ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600">Pending</span>
                      </div>
                    ) : (
                      <Send className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleRoleRequest("admin")}
                    disabled={hasPendingAdminRequest || sendRequestMutation.isLoading}
                    className="w-full flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-purple-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-800">Become Admin</p>
                        <p className="text-sm text-gray-600">Manage platform</p>
                      </div>
                    </div>
                    {hasPendingAdminRequest ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600">Pending</span>
                      </div>
                    ) : (
                      <Send className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D1B12]">
                  Personal Information
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
                    Full Name
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
                      <p className="text-gray-800">{displayUser.name}</p>
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
                    <p className="text-gray-800">{displayUser.email}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Photo URL Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
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
                        {displayUser.photoURL || "No profile photo set"}
                      </p>
                    </div>
                  )}
                  {errors.photoURL && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.photoURL.message}
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
                        {displayUser.address || "Not provided"}
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

export default UserProfile;