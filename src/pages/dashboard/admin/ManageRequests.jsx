import { useState } from "react";
import {
  Mail,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  AlertCircle,
  Loader2,
  UserCheck,
  UserX,
  Calendar,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import axiosSecure from "../../../api/axiosSecure";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ManageRequests = () => {
  const { user: firebaseUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("pending");
  const queryClient = useQueryClient();

  // Fetch all requests
  const { 
    data: requests = [], 
    isLoading: requestsLoading,
    refetch: refetchRequests 
  } = useQuery({
    queryKey: ["allRequests"],
    queryFn: async () => {
      try {
        const response = await axiosSecure.get("/requests");
        return response.data;
      } catch (error) {
        console.error("Requests fetch error:", error);
        return [];
      }
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
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

  // Accept request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      await axiosSecure.patch(`/requests/accept/${requestId}`);
    },
    onSuccess: () => {
      Swal.fire({
        title: "Accepted!",
        text: "Request has been accepted",
        icon: "success",
        confirmButtonColor: "#DF603A",
        timer: 2000,
        showConfirmButton: false,
      });
      refetchRequests();
      queryClient.invalidateQueries(["allRequests"]);
    },
    onError: (error) => {
      Swal.fire({
        title: "Failed!",
        text: error.response?.data?.message || "Failed to accept request",
        icon: "error",
        confirmButtonColor: "#DF603A",
      });
    },
  });

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      await axiosSecure.patch(`/requests/reject/${requestId}`);
    },
    onSuccess: () => {
      Swal.fire({
        title: "Rejected!",
        text: "Request has been rejected",
        icon: "success",
        confirmButtonColor: "#DF603A",
        timer: 2000,
        showConfirmButton: false,
      });
      refetchRequests();
      queryClient.invalidateQueries(["allRequests"]);
    },
    onError: (error) => {
      Swal.fire({
        title: "Failed!",
        text: error.response?.data?.message || "Failed to reject request",
        icon: "error",
        confirmButtonColor: "#DF603A",
      });
    },
  });

  const handleAcceptRequest = (requestId, requestType, userName, userEmail) => {
    Swal.fire({
      title: "Accept Request?",
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-2">Are you sure you want to accept:</p>
          <p class="font-semibold text-green-600">${userName}</p>
          <p class="text-sm text-gray-600">Email: ${userEmail}</p>
          <p class="text-sm text-gray-600 mt-2">Request Type: <span class="font-medium">${requestType === 'chef' ? 'Chef' : 'Admin'}</span></p>
          <div class="bg-green-50 p-3 rounded-lg border border-green-200 mt-3">
            <p class="text-sm text-green-700">
              ${requestType === 'chef' 
                ? 'User will be registered as a Chef and receive a Chef ID.' 
                : 'User will be registered as an Admin and receive full access.'}
            </p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, Accept as ${requestType === 'chef' ? 'Chef' : 'Admin'}`,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        acceptRequestMutation.mutate(requestId);
      }
    });
  };

  const handleRejectRequest = (requestId, userName) => {
    Swal.fire({
      title: "Reject Request?",
      text: `Request from ${userName} will be rejected.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        rejectRequestMutation.mutate(requestId);
      }
    });
  };

  const filteredRequests = requests.filter((request) => {
    // Filter by status
    if (filter !== "all" && request.requestStatus !== filter) return false;
    
    // Search by name or email
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.userName?.toLowerCase().includes(searchLower) ||
        request.userEmail?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getRequestTypeColor = (type) => {
    switch (type) {
      case "chef":
        return "bg-orange-100 text-orange-800";
      case "admin":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if current user is admin
  if (currentAdmin?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only admins can manage requests.
          </p>
        </div>
      </div>
    );
  }

  if (requestsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FBFAF8] to-gray-100 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#DF603A] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D1B12] mb-2">Loading Requests</h2>
          <p className="text-gray-600">Fetching request information...</p>
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
                Request Management
              </h1>
              <p className="text-gray-600">Manage Chef and Admin requests</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold">
                Total Requests: {requests.length}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {requests.filter(r => r.requestStatus === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-800">
                  {requests.filter(r => r.requestStatus === "approved").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-800">
                  {requests.filter(r => r.requestStatus === "rejected").length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
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
                  <option value="pending">Pending Requests</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="all">All Requests</option>
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

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {requests.length === 0 ? "No Requests" : "No Matching Requests"}
            </h3>
            <p className="text-gray-600">
              {requests.length === 0 
                ? "No requests have been submitted yet" 
                : "Try changing your search/filter"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Request Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${getStatusColor(request.requestStatus)}`}>
                        {getStatusIcon(request.requestStatus)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#2D1B12]">
                          {request.userName}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {request.userEmail}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(request.requestTime).toLocaleDateString('en-US')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRequestTypeColor(request.requestType)}`}>
                        {request.requestType === 'chef' ? 'Chef Request' : 'Admin Request'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Request Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <p className="text-sm text-gray-600">Requested User Type</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRequestTypeColor(request.requestType)}`}>
                          {request.requestType === 'chef' ? 'Chef' : 'Admin'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {request.requestType === 'chef' 
                            ? 'Wants to register as a Home Cook' 
                            : 'Wants to manage the platform'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <p className="text-sm text-gray-600">Request Time</p>
                      </div>
                      <p className="font-medium text-sm">
                        {new Date(request.requestTime).toLocaleString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t">
                    {request.requestStatus === "pending" ? (
                      <>
                        <button
                          onClick={() => handleAcceptRequest(
                            request._id, 
                            request.requestType, 
                            request.userName, 
                            request.userEmail
                          )}
                          disabled={acceptRequestMutation.isLoading}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                        
                        <button
                          onClick={() => handleRejectRequest(request._id, request.userName)}
                          disabled={rejectRequestMutation.isLoading}
                          className="flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <div className="text-sm text-gray-600 italic">
                        Request {request.requestStatus === "approved" ? "approved" : "rejected"} - No action available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Request Guidelines */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Request Processing Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-purple-800">When Accepting Chef Request</h4>
              </div>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• User role will change to "chef"</li>
                <li>• Unique Chef ID will be generated</li>
                <li>• Can create meals and accept orders</li>
                <li>• Will get access to Chef Dashboard</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-purple-800">When Accepting Admin Request</h4>
              </div>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• User role will change to "admin"</li>
                <li>• Will get full platform control</li>
                <li>• Will get access to Admin Dashboard</li>
                <li>• Only for trusted users</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageRequests;