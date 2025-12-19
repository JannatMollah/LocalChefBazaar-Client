import { useState } from "react";
import {
  User,
  Mail,
  Shield,
  ChefHat,
  UserCheck,
  UserX,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import axiosSecure from "../../../api/axiosSecure";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ManageUsers = () => {
  const { user: firebaseUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch all users
  const { 
    data: users = [], 
    isLoading: usersLoading,
    refetch: refetchUsers 
  } = useQuery({
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
  });

  // Fetch current admin data
  const { data: currentAdmin } = useQuery({
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

  // Mark as fraud mutation
  const markFraudMutation = useMutation({
    mutationFn: async (userEmail) => {
      await axiosSecure.patch(`/users/fraud/${userEmail}`);
    },
    onSuccess: () => {
      Swal.fire({
        title: "Marked!",
        text: "User has been marked as fraud",
        icon: "success",
        confirmButtonColor: "#DF603A",
        timer: 2000,
        showConfirmButton: false,
      });
      refetchUsers();
      queryClient.invalidateQueries(["allUsers"]);
    },
    onError: (error) => {
      Swal.fire({
        title: "Failed!",
        text: error.response?.data?.message || "Failed to mark as fraud",
        icon: "error",
        confirmButtonColor: "#DF603A",
      });
    },
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userEmail, newRole }) => {
      await axiosSecure.put(`/users/${userEmail}`, { role: newRole });
    },
    onSuccess: () => {
      Swal.fire({
        title: "Success!",
        text: "User role has been changed",
        icon: "success",
        confirmButtonColor: "#DF603A",
        timer: 2000,
        showConfirmButton: false,
      });
      refetchUsers();
      queryClient.invalidateQueries(["allUsers"]);
    },
    onError: (error) => {
      Swal.fire({
        title: "Failed!",
        text: error.response?.data?.message || "Failed to change role",
        icon: "error",
        confirmButtonColor: "#DF603A",
      });
    },
  });

  const handleMarkFraud = (userEmail, userName) => {
    Swal.fire({
      title: "Mark as Fraud?",
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-2">Are you sure you want to mark:</p>
          <p class="font-semibold text-red-600">${userName}</p>
          <p class="text-sm text-gray-600 mt-2">When marked as fraud:</p>
          <ul class="text-sm text-gray-600 list-disc pl-4 mt-2">
            <li>User cannot place orders</li>
            <li>If chef, cannot create new meals</li>
            <li>All activities will be restricted</li>
          </ul>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Mark as Fraud",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        markFraudMutation.mutate(userEmail);
      }
    });
  };

  const handleChangeRole = (userEmail, userName, currentRole) => {
    Swal.fire({
      title: "Change Role",
      html: `
        <div class="text-left space-y-4">
          <div>
            <p class="text-gray-700 mb-2">User: <span class="font-semibold">${userName}</span></p>
            <p class="text-sm text-gray-600">Current Role: <span class="font-medium">${currentRole}</span></p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Select New Role</label>
            <select id="newRole" class="w-full border rounded-lg p-2">
              <option value="user" ${currentRole === 'user' ? 'selected' : ''}>User</option>
              <option value="chef" ${currentRole === 'chef' ? 'selected' : ''}>Chef</option>
              <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
          </div>
          <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p class="text-sm text-yellow-700">
              ⚠️ Admin role is only for trusted users.
            </p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#DF603A",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Change Role",
      preConfirm: () => {
        const newRole = document.getElementById("newRole").value;
        if (newRole === currentRole) {
          Swal.showValidationMessage("Role hasn't changed");
          return false;
        }
        return { newRole };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        changeRoleMutation.mutate({ 
          userEmail, 
          newRole: result.value.newRole 
        });
      }
    });
  };

  const filteredUsers = users.filter((user) => {
    // Filter by role/status
    if (filter === "user" && user.role !== "user") return false;
    if (filter === "chef" && user.role !== "chef") return false;
    if (filter === "admin" && user.role !== "admin") return false;
    if (filter === "fraud" && user.status !== "fraud") return false;
    if (filter === "active" && user.status !== "active") return false;
    
    // Search by name or email
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return { bg: "bg-purple-100", text: "text-purple-800", icon: <Shield className="w-3 h-3" /> };
      case "chef":
        return { bg: "bg-orange-100", text: "text-orange-800", icon: <ChefHat className="w-3 h-3" /> };
      default:
        return { bg: "bg-blue-100", text: "text-blue-800", icon: <User className="w-3 h-3" /> };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return { bg: "bg-green-100", text: "text-green-800", icon: <CheckCircle className="w-3 h-3" /> };
      case "fraud":
        return { bg: "bg-red-100", text: "text-red-800", icon: <XCircle className="w-3 h-3" /> };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", icon: <User className="w-3 h-3" /> };
    }
  };

  // Check if current user is admin
  if (currentAdmin?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only admins can manage users.
          </p>
        </div>
      </div>
    );
  }

  if (usersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#DF603A] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Loading Users</h2>
          <p className="text-gray-600">Fetching all user information...</p>
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
                User Management
              </h1>
              <p className="text-gray-600">View and manage all registered users</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold">
                Total Users: {users.length}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-800">{users.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chefs</p>
                <p className="text-2xl font-bold text-orange-800">
                  {users.filter(u => u.role === "chef").length}
                </p>
              </div>
              <ChefHat className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-purple-800">
                  {users.filter(u => u.role === "admin").length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fraud Users</p>
                <p className="text-2xl font-bold text-red-800">
                  {users.filter(u => u.status === "fraud").length}
                </p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
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
                  <option value="all">All Users</option>
                  <option value="user">User</option>
                  <option value="chef">Chef</option>
                  <option value="admin">Admin</option>
                  <option value="active">Active</option>
                  <option value="fraud">Fraud</option>
                </select>
              </div>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DF603A] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {users.length === 0 ? "No Users" : "No Matching Users"}
            </h3>
            <p className="text-gray-600">
              {users.length === 0 
                ? "No users have registered yet" 
                : "Try changing your search/filter"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-4 font-semibold text-gray-700">User</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Registration</th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            {user.photoURL ? (
                              <img 
                                src={user.photoURL} 
                                alt={user.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center bg-gray-300">
                                      <User class="w-6 h-6 text-gray-600" />
                                    </div>
                                  `;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                <User className="w-6 h-6 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.chefId && (
                              <p className="text-xs text-gray-500">Chef ID: {user.chefId}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleBadge(user.role).bg} ${getRoleBadge(user.role).text}`}>
                            {getRoleBadge(user.role).icon}
                            {user.role === "admin" ? "Admin" : 
                             user.role === "chef" ? "Chef" : "User"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(user.status).bg} ${getStatusBadge(user.status).text}`}>
                            {getStatusBadge(user.status).icon}
                            {user.status === "active" ? "Active" : "Fraud"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-600">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : "Not specified"}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          {/* Mark as Fraud button - only for non-admin users */}
                          {user.role !== "admin" && user.status !== "fraud" && (
                            <button
                              onClick={() => handleMarkFraud(user.email, user.name)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                              title="Mark as Fraud"
                            >
                              <Ban className="w-4 h-4" />
                              Fraud
                            </button>
                          )}
                          
                          {/* Change Role button - only for non-current-admin users */}
                          {user.email !== currentAdmin?.email && (
                            <button
                              onClick={() => handleChangeRole(user.email, user.name, user.role)}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                              title="Change Role"
                            >
                              <UserCheck className="w-4 h-4" />
                              Role
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Management Guidelines */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            User Management Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Ban className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-purple-800">Effects of Marking as Fraud</h4>
              </div>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• User cannot place orders</li>
                <li>• If chef, cannot create new meals</li>
                <li>• Admin access will be revoked</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-purple-800">Admin Access</h4>
              </div>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Admin role is only for trusted users</li>
                <li>• Admins get full platform control</li>
                <li>• Cannot change your own admin role</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;