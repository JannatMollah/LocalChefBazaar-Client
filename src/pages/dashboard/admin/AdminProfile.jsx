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
  Loader2,
  BadgeCheck,
  Settings,
  Key,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import axiosSecure from "../../../api/axiosSecure";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Form schema for admin profile
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  photoURL: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
});

const AdminProfile = () => {
  const { user: firebaseUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch admin data from MongoDB
  const { 
    data: admin, 
    isLoading: adminLoading, 
    error: adminError,
    refetch: refetchAdmin 
  } = useQuery({
    queryKey: ["adminData", firebaseUser?.email],
    queryFn: async () => {
      if (!firebaseUser?.email) return null;
      
      try {
        const response = await axiosSecure.get(`/users/profile/me`);
        return response.data.user;
      } catch (error) {
        console.error("Admin data fetch error:", error);
        throw error;
      }
    },
    enabled: !!firebaseUser?.email,
    refetchOnWindowFocus: false,
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

  // Initialize form with admin data
  useEffect(() => {
    if (admin) {
      setValue("name", admin.name || firebaseUser?.displayName || "");
      setValue("address", admin.address || "");
      setValue("photoURL", admin.photoURL || firebaseUser?.photoURL || "");
    }
  }, [admin, firebaseUser, setValue]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axiosSecure.patch("/users/profile", data);
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
      
      refetchAdmin();
      queryClient.invalidateQueries(["adminData", firebaseUser.email]);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      Swal.fire({
        title: "Failed!",
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
    if (admin) {
      reset({
        name: admin.name || firebaseUser?.displayName || "",
        address: admin.address || "",
        photoURL: admin.photoURL || firebaseUser?.photoURL || "",
      });
    }
    setIsEditing(false);
  };

  // Loading state
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#DF603A] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Loading Admin Profile</h2>
          <p className="text-gray-600">Fetching your information...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (admin?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only admins can access this page.
          </p>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="bg-[#DF603A] text-white px-6 py-3 rounded-xl hover:bg-[#c95232] transition"
          >
            Go to Dashboard
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
                Admin Profile
              </h1>
              <p className="text-gray-600">Manage your admin account</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Super Admin</span>
              </div>
              {admin?.status === "active" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  <BadgeCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Admin Stats & Info */}
          <div className="space-y-6">
            {/* Admin Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <div className="text-center mb-6">
                <div className="relative mx-auto w-32 h-32 mb-4">
                  {photoURL || admin?.photoURL ? (
                    <img
                      src={photoURL || admin?.photoURL}
                      alt={admin?.name}
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center border-4 border-white shadow-xl">
                            <Shield class="w-16 h-16 text-white" />
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center border-4 border-white shadow-xl">
                      <Shield className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-[#2D1B12]">
                  {admin?.name || "Admin"}
                </h2>
                <p className="text-gray-600 mt-1">{admin?.email}</p>
                
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {admin?.role || "Admin"}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    admin?.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {admin?.status === 'active' ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-800">Member Since</p>
                    <p className="text-sm text-gray-600">
                      {admin?.createdAt 
                        ? new Date(admin.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "Not specified"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Key className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-800">Access Level</p>
                    <p className="text-sm text-gray-600">Full Access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D1B12]">
                  Edit Profile
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-[#DF603A] text-white px-4 py-2 rounded-xl hover:bg-[#c95232] transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
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
                      <p className="text-gray-800">{admin?.name || "Not specified"}</p>
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
                    <p className="text-gray-800">{admin?.email}</p>
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
                        {admin.image}
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
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      {...register("address")}
                      rows="3"
                      className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
                      placeholder="Enter your complete address"
                    />
                  ) : (
                    <div className="border rounded-xl p-3 bg-gray-50">
                      <p className="text-gray-800">
                        {admin?.address || "Not provided"}
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
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
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

export default AdminProfile;